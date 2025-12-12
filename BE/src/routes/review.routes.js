const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, authorizeAdmin } = require('../middleware/auth.middleware');

// GET all reviews for a product
router.get('/product/:productId', reviewController.getReviewsByProduct);

// GET single review by ID
router.get('/:id', reviewController.getReviewById);

// POST create new review (protected - user must be logged in)
router.post('/', protect, reviewController.createReview);

// PUT update review (protected - user must be logged in and owner)
router.put('/:id', protect, reviewController.updateReview);

// DELETE review (protected - owner or admin)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
