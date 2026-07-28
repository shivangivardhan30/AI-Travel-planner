const prisma = require('../config/db');
const aiService = require('../services/aiService');
const costEstimatorService = require('../services/costEstimatorService');
const weatherService = require('../services/weatherService');

exports.recommend = async (req, res) => {
  try {
    const preferences = req.body;
    
    // Quick validation
    if (!preferences.origin || !preferences.startDate || !preferences.endDate || !preferences.budget) {
      return res.status(400).json({ error: 'Missing required preference fields (origin, startDate, endDate, budget).' });
    }

    const recommendations = await aiService.recommendDestinations(preferences);
    res.json({ recommendations });
  } catch (error) {
    console.error('Recommend error:', error);
    res.status(500).json({ error: 'Server error generating recommendations.' });
  }
};

exports.generate = async (req, res) => {
  try {
    const preferences = req.body;
    const { destinationName } = preferences;

    if (!destinationName) {
      return res.status(400).json({ error: 'destinationName is required to generate a specific plan.' });
    }

    // Look up destination
    const destinationRaw = await prisma.destination.findUnique({
      where: { name: destinationName }
    });

    if (!destinationRaw) {
      return res.status(404).json({ error: 'Destination not found in our database.' });
    }

    const { parseDestination } = require('../utils/dbHelpers');
    const destination = parseDestination(destinationRaw);

    const duration = Math.max(1, Math.ceil((new Date(preferences.endDate) - new Date(preferences.startDate)) / (1000 * 60 * 60 * 24)));
    const budgetTier = aiService.determineBudgetTier(preferences.budget, duration, preferences.numberOfTravellers || 1);

    // Run parallel services
    const [weather, costEstimate, packingList, itinerary] = await Promise.all([
      weatherService.getDestinationWeather(destination, preferences.startDate, preferences.endDate),
      costEstimatorService.estimateTripCost({
        destination,
        budgetTier,
        durationDays: duration,
        travellers: preferences.numberOfTravellers || 1,
        transportPreference: preferences.transportPreference || 'Any'
      }),
      aiService.generatePackingList(destination, preferences),
      aiService.generateItinerary(destination, preferences, budgetTier)
    ]);

    res.json({
      destination,
      preferences,
      durationDays: duration,
      budgetTier,
      weatherInfo: weather,
      costEstimate,
      packingList,
      itinerary
    });

  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({ error: 'Server error generating complete trip plan.' });
  }
};

exports.saveTrip = async (req, res) => {
  try {
    const { 
      origin, 
      destination, 
      startDate, 
      endDate, 
      numberOfTravellers, 
      budget, 
      travelStyle, 
      transportPreference, 
      interests, 
      costEstimate, 
      weatherInfo, 
      packingList, 
      itinerary 
    } = req.body;

    if (!origin || !destination || !startDate || !endDate || !itinerary) {
      return res.status(400).json({ error: 'Missing critical trip information to save.' });
    }

    // Double-check if destination exists (optional lookup)
    const destRecord = await prisma.destination.findUnique({ where: { name: destination } });
    const image = destRecord ? destRecord.image : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

    const savedTrip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        origin,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfTravellers: parseInt(numberOfTravellers) || 1,
        budget: parseFloat(budget) || 0,
        travelStyle: travelStyle || 'Solo',
        transportPreference: transportPreference || 'Any',
        interests: JSON.stringify(interests || []),
        estimatedTransportCost: parseFloat(costEstimate.transport) || 0,
        estimatedHotelCost: parseFloat(costEstimate.stay) || 0,
        estimatedFoodCost: parseFloat(costEstimate.food) || 0,
        estimatedLocalTravelCost: parseFloat(costEstimate.localTravel) || 0,
        estimatedActivitiesCost: parseFloat(costEstimate.activities) || 0,
        estimatedMiscCost: parseFloat(costEstimate.misc) || 0,
        estimatedTotalCost: parseFloat(costEstimate.total) || 0,
        weatherData: JSON.stringify(weatherInfo || {}),
        packingList: JSON.stringify(packingList || {}),
        itinerary: {
          create: {
            totalCost: parseFloat(itinerary.totalEstimatedCost || costEstimate.total || 0),
            days: {
              create: itinerary.days.map(day => ({
                dayNumber: day.dayNumber,
                morning: day.morning || '',
                afternoon: day.afternoon || '',
                evening: day.evening || '',
                estimatedCost: parseFloat(day.estimatedCost) || 0
              }))
            }
          }
        }
      },
      include: {
        itinerary: {
          include: {
            days: {
              orderBy: { dayNumber: 'asc' }
            }
          }
        }
      }
    });

    // Add extra destination details dynamically for frontend
    const result = {
      ...savedTrip,
      destinationImage: image
    };

    res.status(201).json({ message: 'Trip saved successfully.', trip: result });
  } catch (error) {
    console.error('Save trip error:', error);
    res.status(500).json({ error: 'Server error saving trip.' });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'asc' },
      include: {
        itinerary: {
          include: {
            days: {
              orderBy: { dayNumber: 'asc' }
            }
          }
        }
      }
    });

    // Enrich with destination images
    const { parseTrip } = require('../utils/dbHelpers');
    const enrichedTrips = await Promise.all(trips.map(async (trip) => {
      const destRaw = await prisma.destination.findUnique({
        where: { name: trip.destination },
        select: { image: true }
      });
      const parsedTrip = parseTrip(trip);
      return {
        ...parsedTrip,
        destinationImage: destRaw ? destRaw.image : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
      };
    }));

    res.json({ trips: enrichedTrips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Server error retrieving trips.' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        itinerary: {
          include: {
            days: {
              orderBy: { dayNumber: 'asc' }
            }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Security check: must belong to the user
    if (trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    const destRaw = await prisma.destination.findUnique({
      where: { name: trip.destination }
    });

    const { parseTrip, parseDestination } = require('../utils/dbHelpers');
    const parsedTrip = parseTrip(trip);
    const dest = parseDestination(destRaw);

    res.json({
      trip: {
        ...parsedTrip,
        destinationImage: dest ? dest.image : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        destinationDetails: dest
      }
    });
  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ error: 'Server error retrieving trip details.' });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const { startDate, endDate, budget, numberOfTravellers, packingList } = req.body;
    
    // First retrieve to verify ownership
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    // Prepare updates
    const updateData = {};
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (budget) updateData.budget = parseFloat(budget);
    if (numberOfTravellers) updateData.numberOfTravellers = parseInt(numberOfTravellers);
    if (packingList) updateData.packingList = JSON.stringify(packingList);

    const updatedRaw = await prisma.trip.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        itinerary: {
          include: {
            days: {
              orderBy: { dayNumber: 'asc' }
            }
          }
        }
      }
    });

    const { parseTrip } = require('../utils/dbHelpers');
    const updated = parseTrip(updatedRaw);

    res.json({ message: 'Trip updated successfully.', trip: updated });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Server error updating trip.' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    await prisma.trip.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Server error deleting trip.' });
  }
};
