const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const costEstimatorService = require('./costEstimatorService');
const weatherService = require('./weatherService');

class AIService {
  constructor() {
    this.modelName = 'gemini-1.5-flash';
  }

  /**
   * Helper to get Gemini Client if key is configured
   */
  getGeminiClient() {
    const apiKey = process.env.AI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      return new GoogleGenerativeAI(apiKey);
    }
    return null;
  }

  /**
   * Suggests top 3 destinations based on preferences
   */
  async recommendDestinations(preferences) {
    const client = this.getGeminiClient();
    
    // Fetch all available destinations from DB to supply context to AI or use for local matching
    const allDestinationsRaw = await prisma.destination.findMany();
    const { parseDestination } = require('../utils/dbHelpers');
    const allDestinations = allDestinationsRaw.map(d => parseDestination(d));

    if (client) {
      try {
        console.log("Calling Gemini API for destination recommendations...");
        const model = client.getGenerativeModel({ model: this.modelName });
        
        const prompt = `
          You are an expert travel assistant. Suggest the top 3 best destinations from the following available list for this traveler:
          Traveler Profile:
          - Origin/Starting City: ${preferences.origin}
          - Start Date: ${preferences.startDate}
          - End Date: ${preferences.endDate}
          - Budget: ₹${preferences.budget}
          - Number of Travellers: ${preferences.numberOfTravellers}
          - Travel Style/Type: ${preferences.travelStyle} (e.g. Solo, Couple, Friends, Family)
          - Interests: ${JSON.stringify(preferences.interests)} (e.g. Adventure, Nature, Mountains, Beaches, Historical, Food, Nightlife)
          - Preferred Weather: ${preferences.preferredWeather} (e.g. Cold, Pleasant, Warm, Any)
          - Preferred Transport: ${preferences.transportPreference} (e.g. Flight, Train, Bus, Car, Any)

          Available Destinations List:
          ${JSON.stringify(allDestinations.map(d => ({ name: d.name, state: d.state, country: d.country, typicalSeason: d.typicalSeason, typicalCosts: d.typicalCosts, popularActivities: d.popularActivities, description: d.description })))}

          Return EXACTLY a JSON array of 3 recommended destinations. Do not include markdown wraps like \`\`\`json. Return only the raw JSON.
          Format:
          [
            {
              "destinationName": "Name of destination exactly matching the list",
              "matchScore": 95,
              "reason": "Why this is recommended based on their interests and dates."
            }
          ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Clean markdown backticks if Gemini includes them
        const cleanedText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        const recommendations = JSON.parse(cleanedText);

        // Map recommendations back to database objects and enrich them
        return await this.enrichRecommendations(recommendations, preferences);
      } catch (error) {
        console.error("Gemini recommendation failed, falling back to local engine:", error.message);
      }
    }

    // Local Fallback: Rule-based recommendation engine
    console.log("Running local rule-based destination recommendations...");
    const scoredDestinations = allDestinations.map(dest => {
      let score = 50; // Starting base score

      // 1. Weather compatibility
      const startMonth = new Date(preferences.startDate).getMonth();
      let season = "winter";
      if (startMonth >= 2 && startMonth <= 5) season = "summer";
      else if (startMonth >= 6 && startMonth <= 8) season = "monsoon";

      const prefWeather = preferences.preferredWeather ? preferences.preferredWeather.toLowerCase() : "any";
      const typicalWeather = dest.typicalWeather[season] || {};
      const condition = typicalWeather.condition ? typicalWeather.condition.toLowerCase() : "";

      if (prefWeather === "cold") {
        if (dest.typicalSeason.toLowerCase().includes("cold") || dest.typicalSeason.toLowerCase().includes("mountain")) score += 20;
        else if (condition.includes("cold") || condition.includes("snow")) score += 20;
      } else if (prefWeather === "warm") {
        if (dest.typicalSeason.toLowerCase().includes("desert") || dest.typicalSeason.toLowerCase().includes("beach")) score += 15;
      } else if (prefWeather === "pleasant") {
        if (condition.includes("pleasant") || condition.includes("mild")) score += 20;
      }

      // 2. Interest compatibility
      const interests = preferences.interests || [];
      const destActivities = dest.popularActivities || [];
      const attractions = dest.popularAttractions || [];
      
      let interestMatches = 0;
      interests.forEach(interest => {
        const lowerInterest = interest.toLowerCase();
        
        // Match against description/activities/attractions
        if (dest.description.toLowerCase().includes(lowerInterest)) interestMatches++;
        if (dest.typicalSeason.toLowerCase().includes(lowerInterest)) interestMatches++;
        
        const actMatch = destActivities.some(act => act.toLowerCase().includes(lowerInterest));
        if (actMatch) interestMatches++;

        const attrMatch = attractions.some(attr => attr.toLowerCase().includes(lowerInterest));
        if (attrMatch) interestMatches++;
      });
      
      score += interestMatches * 8;

      // 3. Travel Style suitability
      const style = (preferences.travelStyle || "Solo").toLowerCase();
      if (style === "solo") {
        if (dest.name === "Rishikesh" || dest.name === "Goa" || dest.name === "Leh-Ladakh") score += 10;
      } else if (style === "couple") {
        if (dest.name === "Udaipur" || dest.name === "Kerala" || dest.name === "Mussoorie") score += 10;
      } else if (style === "family") {
        if (dest.name === "Shimla" || dest.name === "Agra" || dest.name === "Jaipur") score += 10;
      }

      // 4. Budget suitability check
      const duration = Math.max(1, Math.ceil((new Date(preferences.endDate) - new Date(preferences.startDate)) / (1000 * 60 * 60 * 24)));
      const budgetTier = this.determineBudgetTier(preferences.budget, duration, preferences.numberOfTravellers);
      
      // Calculate costs using estimator
      const estCosts = costEstimatorService.estimateTripCost({
        destination: dest,
        budgetTier,
        durationDays: duration,
        travellers: preferences.numberOfTravellers,
        transportPreference: preferences.transportPreference
      });

      // If estimated cost exceeds total budget by more than 20%, penalize score
      if (estCosts.total > preferences.budget) {
        const excessRatio = estCosts.total / preferences.budget;
        score -= Math.round((excessRatio - 1) * 30);
      } else {
        score += 10; // fits budget well
      }

      // Clamp match score between 65% and 98%
      const matchScore = Math.max(65, Math.min(98, score));

      // Construct dynamic reasoning
      let reason = `Recommended because of your interest in ${interests.slice(0, 2).join(', ') || 'traveling'}. `;
      reason += `It matches your weather preference (${preferences.preferredWeather || 'Any'}) for this season, `;
      reason += `and fits your budget profile (${budgetTier.toUpperCase()} tier).`;

      return {
        destinationName: dest.name,
        matchScore,
        reason,
        estCosts
      };
    });

    // Sort by match score descending and take top 3
    const topScored = scoredDestinations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    return await this.enrichRecommendations(topScored, preferences);
  }

  /**
   * Maps recommendation titles back to DB models, calculates costs and weather
   */
  async enrichRecommendations(recommendations, preferences) {
    const enriched = [];
    const duration = Math.max(1, Math.ceil((new Date(preferences.endDate) - new Date(preferences.startDate)) / (1000 * 60 * 60 * 24)));
    const budgetTier = this.determineBudgetTier(preferences.budget, duration, preferences.numberOfTravellers);

    for (const rec of recommendations) {
      const destRaw = await prisma.destination.findUnique({
        where: { name: rec.destinationName }
      });
      const { parseDestination } = require('../utils/dbHelpers');
      const dest = parseDestination(destRaw);

      if (dest) {
        const costEstimate = costEstimatorService.estimateTripCost({
          destination: dest,
          budgetTier,
          durationDays: duration,
          travellers: preferences.numberOfTravellers,
          transportPreference: preferences.transportPreference
        });

        const weather = await weatherService.getDestinationWeather(dest, preferences.startDate, preferences.endDate);

        enriched.push({
          destination: dest,
          matchScore: rec.matchScore,
          reason: rec.reason,
          estimatedCostBreakdown: costEstimate,
          estimatedTotalCost: costEstimate.total,
          weatherInfo: weather,
          bestTime: dest.bestTime,
          durationDays: duration
        });
      }
    }
    return enriched.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Generates a day-by-day itinerary
   */
  async generateItinerary(destination, preferences, budgetTier) {
    const { parseDestination } = require('../utils/dbHelpers');
    destination = parseDestination(destination);
    const client = this.getGeminiClient();
    const duration = Math.max(1, Math.ceil((new Date(preferences.endDate) - new Date(preferences.startDate)) / (1000 * 60 * 60 * 24)));

    if (client) {
      try {
        console.log(`Calling Gemini API for itinerary generation for ${destination.name}...`);
        const model = client.getGenerativeModel({ model: this.modelName });
        
        const prompt = `
          You are an expert travel planner. Generate a day-by-day travel itinerary for:
          - Destination: ${destination.name}, ${destination.state}, ${destination.country}
          - Start Date: ${preferences.startDate}
          - End Date: ${preferences.endDate} (${duration} Days)
          - Travel Style: ${preferences.travelStyle}
          - Budget Level: ${budgetTier}
          - Number of Travellers: ${preferences.numberOfTravellers}
          - Interests: ${JSON.stringify(preferences.interests)}
          - Famous Attractions Available: ${JSON.stringify(destination.popularAttractions)}
          - Popular Activities Available: ${JSON.stringify(destination.popularActivities)}

          Return EXACTLY a JSON object. Do not include markdown wraps. Return only the raw JSON.
          Format:
          {
            "totalEstimatedCost": 15000,
            "days": [
              {
                "dayNumber": 1,
                "morning": "Detailed morning activity description.",
                "afternoon": "Detailed afternoon activity and lunch description.",
                "evening": "Detailed evening activity and dinner recommendation.",
                "estimatedCost": 1200
              }
            ]
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        const cleanedText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        return JSON.parse(cleanedText);
      } catch (error) {
        console.error("Gemini itinerary failed, falling back to local engine:", error.message);
      }
    }

    // Local Fallback: Rule-based itinerary generator
    console.log(`Running local rule-based itinerary generator for ${destination.name}...`);
    
    const attractions = destination.popularAttractions || [];
    const activities = destination.popularActivities || [];
    const destCosts = costEstimatorService.estimateTripCost({
      destination,
      budgetTier,
      durationDays: duration,
      travellers: preferences.numberOfTravellers,
      transportPreference: preferences.transportPreference
    });

    const dailyBudget = Math.round((destCosts.stay + destCosts.food + destCosts.localTravel + destCosts.activities + destCosts.misc) / duration);

    const days = [];
    for (let d = 1; d <= duration; d++) {
      const morningActivity = d === 1 
        ? `Arrive in ${destination.name}. Complete check-in at hotel/resort. Rest and acclimatize.` 
        : `Start early. Head to ${attractions[(d - 1) % attractions.length] || 'local landmark'} for standard sightseeing. Take pictures and enjoy the local scenery.`;

      const afternoonActivity = d === duration 
        ? `Check out of the accommodation. Do last-minute shopping at local markets and purchase souvenirs.` 
        : `Indulge in ${activities[(d - 1) % activities.length] || 'sightseeing'}. Have lunch at a recommended local restaurant trying popular local dishes.`;

      const eveningActivity = d === duration
        ? `Depart from ${destination.name} with beautiful memories of your trip.`
        : `Stroll through the local streets or visit ${attractions[d % attractions.length] || 'nearby market'}. Experience the local nightlife or attend evening prayers/cultural shows, followed by a cozy dinner.`;

      // Distribute costs (Day 1 check-in, Day last checkout, standard middle days)
      let dayCost = dailyBudget;
      if (d === duration) dayCost = Math.round(dailyBudget * 0.5);

      days.push({
        dayNumber: d,
        morning: morningActivity,
        afternoon: afternoonActivity,
        evening: eveningActivity,
        estimatedCost: dayCost
      });
    }

    return {
      totalEstimatedCost: destCosts.total,
      days
    };
  }

  /**
   * Generates things you'll need / packing list & documents
   */
  async generatePackingList(destination, preferences) {
    const { parseDestination } = require('../utils/dbHelpers');
    destination = parseDestination(destination);
    const client = this.getGeminiClient();

    if (client) {
      try {
        console.log(`Calling Gemini API for packing checklist for ${destination.name}...`);
        const model = client.getGenerativeModel({ model: this.modelName });
        
        const prompt = `
          Provide a travel preparation checklist for a trip to ${destination.name}.
          - Start Date: ${preferences.startDate}
          - End Date: ${preferences.endDate}
          - Travel Style: ${preferences.travelStyle}
          - Interests: ${JSON.stringify(preferences.interests)}
          - Destination climate type: ${destination.typicalSeason}

          Return EXACTLY a JSON object. Do not include markdown wraps. Return only the raw JSON.
          Format:
          {
            "clothing": ["Item 1", "Item 2"],
            "documents": ["Passport (if international)", "Aadhar Card/ID"],
            "gear": ["Camera", "Charger"],
            "healthAndSafety": ["First aid kit", "Medicines"],
            "currency": "Information on currency to use",
            "entryRequirements": "Visa / permits / entry requirements"
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        const cleanedText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        return JSON.parse(cleanedText);
      } catch (error) {
        console.error("Gemini packing list failed, falling back to local engine:", error.message);
      }
    }

    // Local Fallback: Rule-based checklist generator
    console.log(`Running local rule-based packing list for ${destination.name}...`);
    const clothing = ["Comfortable walking shoes", "Sunglasses", "Hat / Cap"];
    const gear = ["Mobile charger", "Power bank", "Camera / Phone"];
    const healthAndSafety = ["Personal medications", "First aid kit (Painkillers, Band-aids, Antacids)", "Hand sanitizer & Wet wipes"];
    
    // Determine season from dates
    const startMonth = new Date(preferences.startDate).getMonth();
    let season = "winter";
    if (startMonth >= 2 && startMonth <= 5) season = "summer";
    else if (startMonth >= 6 && startMonth <= 8) season = "monsoon";

    // 1. Weather specific clothing
    if (destination.typicalSeason.toLowerCase().includes("cold") || destination.typicalSeason.toLowerCase().includes("mountain")) {
      clothing.push("Heavy jacket / Overcoat", "Sweaters or Thermals", "Woolen socks & Gloves", "Lip balm & moisturizer");
    } else if (destination.typicalSeason.toLowerCase().includes("beach") || destination.typicalSeason.toLowerCase().includes("tropical")) {
      clothing.push("Lightweight cotton clothes", "Swimwear", "Sunscreen (SPF 50+)", "Flip flops");
    } else {
      clothing.push("Casual layerable outfits", "Light jacket (for evenings)");
    }

    if (season === "monsoon") {
      clothing.push("Quick-dry clothing");
      gear.push("Umbrella / Raincoat", "Waterproof bag cover", "Waterproof pouch for phones");
    }

    // 2. Interest specific gear
    const interests = preferences.interests || [];
    if (interests.some(i => i.toLowerCase().includes("adventure") || i.toLowerCase().includes("trekking"))) {
      gear.push("Trekking shoes", "Small backpack", "Reusable water bottle");
    }
    if (interests.some(i => i.toLowerCase().includes("religious") || i.toLowerCase().includes("spiritual"))) {
      clothing.push("Modest traditional attire (temple visits)");
    }

    // 3. Documents
    const documents = ["Government ID Card (Aadhar Card, Driving License, or Voter ID)"];
    let entryRequirements = "No special entry permit required for domestic travellers. Carry a government-issued photo ID.";
    let currency = "Indian Rupee (₹). UPI (Google Pay, PhonePe, Paytm) is widely accepted, but carry some cash for remote areas.";

    if (destination.country && destination.country.toLowerCase() !== "india") {
      documents.push("Valid Passport (at least 6 months validity)", "Visa Copy / Travel Insurance Certificate");
      entryRequirements = `Verify visa requirements for ${destination.country}. Standard visa or e-Visa might be required. Travel insurance is highly recommended.`;
      currency = `Local currency of ${destination.country}. Credit cards are widely accepted at major establishments; carry a small amount of local currency cash.`;
    } else {
      // Domestic exceptions
      if (destination.name === "Leh-Ladakh") {
        entryRequirements = "Inner Line Permit (ILP) is required for domestic/foreign tourists visiting protected areas (Pangong, Nubra). Can be applied online or obtained at Leh.";
      } else if (destination.name === "Andaman & Nicobar Islands") {
        entryRequirements = "RAP (Restricted Area Permit) is generally waived for domestic tourists, but check permissions for specific small islands. Keep your ID handy.";
      }
    }

    return {
      clothing,
      documents,
      gear,
      healthAndSafety,
      currency,
      entryRequirements
    };
  }

  /**
   * Helper to determine budget tier (budget, standard, premium) based on cash budget, days, travellers
   */
  determineBudgetTier(totalBudget, durationDays, travellers) {
    const dailyPerPerson = totalBudget / (durationDays * travellers);
    
    if (dailyPerPerson < 2500) {
      return 'budget';
    } else if (dailyPerPerson < 7500) {
      return 'standard';
    } else {
      return 'premium';
    }
  }
}

module.exports = new AIService();
