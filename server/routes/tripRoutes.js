const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/auth');

// Recommendations and custom plan generations (can be requested by guest users too)
router.post('/recommend', tripController.recommend);
router.post('/generate', tripController.generate);

// User-saved trip operations (JWT protected)
router.post('/', authMiddleware, tripController.saveTrip);
router.get('/', authMiddleware, tripController.getTrips);
router.get('/:id', authMiddleware, tripController.getTripById);
router.put('/:id', authMiddleware, tripController.updateTrip);
router.delete('/:id', authMiddleware, tripController.deleteTrip);

// Expense Tracker Operations (JWT protected)
router.post('/:id/expenses', authMiddleware, tripController.addExpense);
router.delete('/:id/expenses/:expenseId', authMiddleware, tripController.deleteExpense);

module.exports = router;
