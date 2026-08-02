/**
 * Cost Estimator Service
 * Estimates costs for travel, stay, food, activities, local transit, and misc
 */
class CostEstimatorService {
  /**
   * Calculates the estimated cost of a trip
   * @param {Object} params
   * @param {Object} params.destination - Destination database object
   * @param {string} params.budgetTier - 'budget' | 'standard' | 'premium'
   * @param {number} params.durationDays - Total duration of the trip in days
   * @param {number} params.travellers - Number of travellers
   * @param {string} params.transportPreference - 'Flight' | 'Train' | 'Bus' | 'Car' | 'Any'
   * @returns {Object} Cost breakdown in INR (₹)
   */
  estimateTripCost({ destination, budgetTier, durationDays, travellers, transportPreference, stayPreference }) {
    const tier = (budgetTier || 'standard').toLowerCase();
    
    let costsMeta = destination.typicalCosts;
    if (typeof costsMeta === 'string') {
      try {
        costsMeta = JSON.parse(costsMeta);
      } catch (e) {
        costsMeta = null;
      }
    }

    if (!costsMeta) {
      costsMeta = {
        transportBase: 2000,
        budget: { hotel: 800, food: 400, local: 300, activities: 400, misc: 200 },
        standard: { hotel: 2000, food: 900, local: 700, activities: 800, misc: 500 },
        premium: { hotel: 6000, food: 2200, local: 2000, activities: 2500, misc: 1200 }
      };
    }

    const tierCosts = costsMeta[tier] || costsMeta.standard;
    const baseTransport = costsMeta.transportBase || 2000;

    // 1. Transport Cost Calculation
    let transportCostPerPerson = baseTransport;
    const pref = (transportPreference || 'Any').toLowerCase();

    if (pref === 'flight') {
      transportCostPerPerson = baseTransport * 2.5; // Flights are premium
    } else if (pref === 'train') {
      transportCostPerPerson = baseTransport * 0.6; // Trains are cheaper
    } else if (pref === 'bus') {
      transportCostPerPerson = baseTransport * 0.4;
    } else if (pref === 'car') {
      // For car, cost is grouped (fuel/toll) rather than strictly per person, but let's approximate
      transportCostPerPerson = (baseTransport * 1.5) / travellers;
    } else {
      // 'Any' or fallback based on tier
      if (tier === 'premium') transportCostPerPerson = baseTransport * 2.5; // assumes flight
      else if (tier === 'budget') transportCostPerPerson = baseTransport * 0.5; // assumes train/bus
      else transportCostPerPerson = baseTransport * 1.2; // standard mix
    }

    // Round transport cost
    const transportTotal = Math.round(transportCostPerPerson * travellers);

    // 2. Hotel/Stay Cost Calculation (assumes 2 people share a room)
    const roomsNeeded = Math.ceil(travellers / 2);
    let stayMultiplier = 1.0;
    const stayPref = (stayPreference || 'Hotel').toLowerCase();
    
    if (stayPref === 'hostel') {
      stayMultiplier = 0.4;
    } else if (stayPref === 'homestay') {
      stayMultiplier = 0.7;
    } else if (stayPref === 'resort') {
      stayMultiplier = 1.8;
    }
    
    const hotelTotal = Math.round(roomsNeeded * (tierCosts.hotel * stayMultiplier) * durationDays);

    // 3. Food Cost Calculation
    const foodTotal = Math.round(travellers * tierCosts.food * durationDays);

    // 4. Local Travel Cost
    // Scale slightly for larger groups requiring cabs vs auto rickshaws
    const groupScale = travellers <= 2 ? 0.8 : (travellers <= 4 ? 1.0 : 1.5);
    const localTotal = Math.round(tierCosts.local * durationDays * groupScale);

    // 5. Activities/Sightseeing Cost
    const activitiesTotal = Math.round(travellers * tierCosts.activities);

    // 6. Miscellaneous Expenses
    const miscTotal = Math.round(travellers * tierCosts.misc * durationDays);

    // Total cost
    const totalCost = transportTotal + hotelTotal + foodTotal + localTotal + activitiesTotal + miscTotal;

    return {
      transport: transportTotal,
      stay: hotelTotal,
      food: foodTotal,
      localTravel: localTotal,
      activities: activitiesTotal,
      misc: miscTotal,
      total: totalCost
    };
  }
}

module.exports = new CostEstimatorService();
