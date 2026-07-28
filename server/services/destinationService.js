const prisma = require('../config/db');
const costEstimatorService = require('./costEstimatorService');
const weatherService = require('./weatherService');

class DestinationService {
  /**
   * Search destinations with text search and category filters
   */
  async searchDestinations(query = '', season = '') {
    const where = {};
    
    if (query && query.trim() !== '') {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (season && season.trim() !== '') {
      where.typicalSeason = { contains: season, mode: 'insensitive' };
    }

    const destinations = await prisma.destination.findMany({ where });
    const { parseDestination } = require('../utils/dbHelpers');
    return destinations.map(d => parseDestination(d));
  }

  /**
   * Compare up to 3 destinations side by side
   * @param {Array<string>} destinationNames - Names of destinations to compare
   * @param {Object} preferences - Starting city, dates, budget, travellers, interests, transport, style
   */
  async compareDestinations(destinationNames, preferences) {
    const names = destinationNames.slice(0, 3);
    const destinationsRaw = await prisma.destination.findMany({
      where: { name: { in: names } }
    });
    const { parseDestination } = require('../utils/dbHelpers');
    const destinations = destinationsRaw.map(d => parseDestination(d));

    const duration = Math.max(1, Math.ceil((new Date(preferences.endDate) - new Date(preferences.startDate)) / (1000 * 60 * 60 * 24)));
    const budget = preferences.budget;
    const travellers = preferences.numberOfTravellers;
    const interests = preferences.interests || [];
    
    // Determine budget tier
    const dailyPerPerson = budget / (duration * travellers);
    const budgetTier = dailyPerPerson < 2500 ? 'budget' : (dailyPerPerson < 7500 ? 'standard' : 'premium');

    const comparisons = [];
    let bestChoiceName = '';
    let highestScore = -1;

    for (const dest of destinations) {
      // 1. Calculate cost breakdown
      const costEstimate = costEstimatorService.estimateTripCost({
        destination: dest,
        budgetTier,
        durationDays: duration,
        travellers,
        transportPreference: preferences.transportPreference
      });

      // 2. Fetch weather estimation
      const weather = await weatherService.getDestinationWeather(dest, preferences.startDate, preferences.endDate);

      // 3. Compute match score locally
      let score = 60;
      
      // Interest match
      const destActivities = dest.popularActivities || [];
      const attractions = dest.popularAttractions || [];
      let matches = 0;
      
      interests.forEach(interest => {
        const lowerInterest = interest.toLowerCase();
        if (dest.description.toLowerCase().includes(lowerInterest)) matches++;
        if (destActivities.some(act => act.toLowerCase().includes(lowerInterest))) matches++;
        if (attractions.some(attr => attr.toLowerCase().includes(lowerInterest))) matches++;
      });
      score += matches * 10;

      // Budget check
      if (costEstimate.total > budget) {
        const excess = costEstimate.total / budget;
        score -= Math.round((excess - 1) * 40);
      } else {
        score += 15;
      }

      // Climate check
      const startMonth = new Date(preferences.startDate).getMonth();
      let seasonName = "winter";
      if (startMonth >= 2 && startMonth <= 5) seasonName = "summer";
      else if (startMonth >= 6 && startMonth <= 8) seasonName = "monsoon";
      
      const typicalWeather = dest.typicalWeather[seasonName] || {};
      const condition = typicalWeather.condition ? typicalWeather.condition.toLowerCase() : "";
      const prefWeather = preferences.preferredWeather ? preferences.preferredWeather.toLowerCase() : "any";

      if (prefWeather === "cold" && (dest.typicalSeason.toLowerCase().includes("cold") || dest.typicalSeason.toLowerCase().includes("mountain"))) {
        score += 15;
      } else if (prefWeather === "pleasant" && condition.includes("pleasant")) {
        score += 15;
      }

      const matchScore = Math.max(60, Math.min(98, score));

      if (matchScore > highestScore) {
        highestScore = matchScore;
        bestChoiceName = dest.name;
      }

      comparisons.push({
        id: dest.id,
        name: dest.name,
        state: dest.state,
        country: dest.country,
        image: dest.image,
        description: dest.description,
        bestTime: dest.bestTime,
        typicalSeason: dest.typicalSeason,
        popularActivities: destActivities,
        popularAttractions: attractions,
        estimatedCost: costEstimate,
        weatherInfo: weather,
        matchScore
      });
    }

    return {
      comparisons,
      bestChoice: bestChoiceName,
      recommendationReason: bestChoiceName 
        ? `Based on your budget, travel dates, and interest in ${interests.slice(0, 2).join(', ') || 'sightseeing'}, ${bestChoiceName} stands out as the optimal choice with a ${highestScore}% match score.`
        : ''
    };
  }
}

module.exports = new DestinationService();
