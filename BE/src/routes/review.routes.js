const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

// GET all reviews for a product
router.get('/product/:productId', reviewController.getReviewsByProduct);

// GET single review by ID
router.get('/:id', reviewController.getReviewById);

// POST create new review
router.post('/', reviewController.createReview);

// PUT update review
router.put('/:id', reviewController.updateReview);

// DELETE review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
