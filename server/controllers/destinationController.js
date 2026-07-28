const prisma = require('../config/db');
const destinationService = require('../services/destinationService');
const weatherService = require('../services/weatherService');
const aiService = require('../services/aiService');

exports.search = async (req, res) => {
  try {
    const { q, season } = req.query;
    const destinations = await destinationService.searchDestinations(q, season);
    res.json({ destinations });
  } catch (error) {
    console.error('Search destinations error:', error);
    res.status(500).json({ error: 'Server error searching destinations.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const destinationRaw = await prisma.destination.findUnique({
      where: { id: req.params.id }
    });

    if (!destinationRaw) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    const { parseDestination } = require('../utils/dbHelpers');
    const destination = parseDestination(destinationRaw);
    res.json({ destination });
  } catch (error) {
    console.error('Get destination by ID error:', error);
    res.status(500).json({ error: 'Server error retrieving destination.' });
  }
};

exports.compare = async (req, res) => {
  try {
    const { destinations, preferences } = req.body;

    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({ error: 'A non-empty list of destinations is required to compare.' });
    }

    if (!preferences || !preferences.startDate || !preferences.endDate) {
      return res.status(400).json({ error: 'Trip dates and preferences are required for accurate comparison.' });
    }

    const comparisonData = await destinationService.compareDestinations(destinations, preferences);
    res.json(comparisonData);
  } catch (error) {
    console.error('Compare destinations error:', error);
    res.status(500).json({ error: 'Server error comparing destinations.' });
  }
};

exports.getWeatherInfo = async (req, res) => {
  try {
    const { destinationName, lat, lon, startDate, endDate } = req.query;

    let dest = null;
    if (destinationName) {
      const destRaw = await prisma.destination.findUnique({ where: { name: destinationName } });
      const { parseDestination } = require('../utils/dbHelpers');
      dest = parseDestination(destRaw);
    }

    // Default object for weather query if destination not in DB
    const weatherTarget = dest || {
      name: destinationName || 'Target Location',
      lat: parseFloat(lat) || 0.0,
      lon: parseFloat(lon) || 0.0,
      typicalWeather: {}
    };

    const weather = await weatherService.getDestinationWeather(
      weatherTarget,
      startDate || new Date(),
      endDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    );

    res.json({ weather });
  } catch (error) {
    console.error('Get weather error:', error);
    res.status(500).json({ error: 'Server error fetching weather details.' });
  }
};

// AI micro-services
exports.generateItineraryDirect = async (req, res) => {
  try {
    const { destinationName, preferences } = req.body;

    if (!destinationName || !preferences) {
      return res.status(400).json({ error: 'destinationName and preferences are required.' });
    }

    const destRaw = await prisma.destination.findUnique({ where: { name: destinationName } });
    if (!destRaw) return res.status(404).json({ error: 'Destination not found.' });
    const { parseDestination } = require('../utils/dbHelpers');
    const dest = parseDestination(destRaw);

    const duration = Math.max(1, Math.ceil((new Date(preferences.endDate) - new Date(preferences.startDate)) / (1000 * 60 * 60 * 24)));
    const budgetTier = aiService.determineBudgetTier(preferences.budget || 20000, duration, preferences.numberOfTravellers || 1);

    const itinerary = await aiService.generateItinerary(dest, preferences, budgetTier);
    res.json({ itinerary });
  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json({ error: 'Server error generating itinerary.' });
  }
};

exports.generatePackingListDirect = async (req, res) => {
  try {
    const { destinationName, preferences } = req.body;

    if (!destinationName || !preferences) {
      return res.status(400).json({ error: 'destinationName and preferences are required.' });
    }

    const destRaw = await prisma.destination.findUnique({ where: { name: destinationName } });
    if (!destRaw) return res.status(404).json({ error: 'Destination not found.' });
    const { parseDestination } = require('../utils/dbHelpers');
    const dest = parseDestination(destRaw);

    const packingList = await aiService.generatePackingList(dest, preferences);
    res.json({ packingList });
  } catch (error) {
    console.error('Generate packing list error:', error);
    res.status(500).json({ error: 'Server error generating packing list.' });
  }
};

// Favourites Management
exports.getFavourites = async (req, res) => {
  try {
    const favourites = await prisma.favourite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = await Promise.all(favourites.map(async (fav) => {
      const destRaw = await prisma.destination.findUnique({
        where: { name: fav.destinationName }
      });
      const { parseDestination } = require('../utils/dbHelpers');
      const dest = parseDestination(destRaw);
      return {
        id: fav.id,
        destinationName: fav.destinationName,
        createdAt: fav.createdAt,
        destination: dest
      };
    }));

    res.json({ favourites: enriched });
  } catch (error) {
    console.error('Get favourites error:', error);
    res.status(500).json({ error: 'Server error retrieving favourites.' });
  }
};

exports.addFavourite = async (req, res) => {
  try {
    const { destinationName } = req.body;

    if (!destinationName) {
      return res.status(400).json({ error: 'destinationName is required.' });
    }

    // Verify destination exists in DB
    const destRaw = await prisma.destination.findUnique({
      where: { name: destinationName }
    });

    if (!destRaw) {
      return res.status(404).json({ error: 'Destination not found in database.' });
    }

    const { parseDestination } = require('../utils/dbHelpers');
    const dest = parseDestination(destRaw);

    const fav = await prisma.favourite.upsert({
      where: {
        userId_destinationName: {
          userId: req.user.id,
          destinationName
        }
      },
      update: {},
      create: {
        userId: req.user.id,
        destinationName
      }
    });

    res.status(201).json({ message: 'Added to favourites.', favourite: fav });
  } catch (error) {
    console.error('Add favourite error:', error);
    res.status(500).json({ error: 'Server error adding to favourites.' });
  }
};

exports.removeFavourite = async (req, res) => {
  try {
    const { destinationName } = req.params;

    if (!destinationName) {
      return res.status(400).json({ error: 'destinationName parameter is required.' });
    }

    await prisma.favourite.delete({
      where: {
        userId_destinationName: {
          userId: req.user.id,
          destinationName
        }
      }
    });

    res.json({ message: 'Removed from favourites.' });
  } catch (error) {
    console.error('Remove favourite error:', error);
    res.status(500).json({ error: 'Server error removing favourite.' });
  }
};
