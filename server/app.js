const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Configure Middleware
app.use(cors());
app.use(express.json());

// Import Routers
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const destinationRoutes = require('./routes/destinationRoutes');

// Import Controllers for standalone endpoints
const destinationController = require('./controllers/destinationController');
const authMiddleware = require('./middleware/auth');

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);

// Standalone REST API specs as requested
app.get('/api/weather', destinationController.getWeatherInfo);

// Standalone AI endpoints
app.post('/api/ai/itinerary', destinationController.generateItineraryDirect);
app.post('/api/ai/packing-list', destinationController.generatePackingListDirect);

// Standalone Favourites endpoints (mapped to the controller directly)
app.get('/api/favourites', authMiddleware, destinationController.getFavourites);
app.post('/api/favourites', authMiddleware, destinationController.addFavourite);
app.delete('/api/favourites/:destinationName', authMiddleware, destinationController.removeFavourite);

// Simple Status Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Root Route fallback
app.get('/', (req, res) => {
  res.send('AI Travel Planner API Server is running.');
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'An internal server error occurred.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
