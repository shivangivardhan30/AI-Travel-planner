const aiService = require('./aiService');

class ItineraryService {
  /**
   * Generates a day-by-day travel plan
   */
  async generateItinerary(destination, preferences, budgetTier) {
    return await aiService.generateItinerary(destination, preferences, budgetTier);
  }
}

module.exports = new ItineraryService();
