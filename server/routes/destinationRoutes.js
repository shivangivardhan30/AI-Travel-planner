const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const authMiddleware = require('../middleware/auth');

// Public search and compare
router.get('/search', destinationController.search);
router.post('/compare', destinationController.compare);
router.get('/:id', destinationController.getById);

// Favourites (JWT protected)
router.get('/favourites/all', authMiddleware, destinationController.getFavourites);
router.post('/favourites/add', authMiddleware, destinationController.addFavourite);
router.delete('/favourites/remove/:destinationName', authMiddleware, destinationController.removeFavourite);

module.exports = router;
