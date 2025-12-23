const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { optionalAuth, protect } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/recommendations
 * @desc    Get product recommendations (personalized if authenticated)
 * @access  Public (enhanced for authenticated users)
 */
router.get('/', optionalAuth, recommendationController.getRecommendations);

/**
 * @route   GET /api/recommendations/personalized
 * @desc    Get personalized recommendations based on purchase history
 * @access  Private
 */
router.get('/personalized', protect, recommendationController.getPersonalizedRecommendations);

/**
 * @route   GET /api/recommendations/top-selling
 * @desc    Get top-selling products
 * @access  Public
 */
router.get('/top-selling', recommendationController.getTopSellingProducts);

module.exports = router;
