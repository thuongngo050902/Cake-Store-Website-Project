const recommendationService = require('../services/recommendation.service');

/**
 * @desc    Get product recommendations
 * @route   GET /api/recommendations
 * @access  Public (personalized if authenticated)
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Extract user ID from request (if authenticated)
    // Will be null for non-authenticated users
    const userId = req.user?.id || null;
    
    // Get limit from query params (default: 6)
    const limit = parseInt(req.query.limit) || 6;
    
    // Validate limit
    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 20'
      });
    }
    
    console.log('[Recommendation Controller] Getting recommendations for user:', userId || 'guest', 'limit:', limit);
    
    const recommendations = await recommendationService.getRecommendations(userId, limit);
    
    res.json({
      success: true,
      count: recommendations.length,
      isPersonalized: !!userId,
      data: recommendations
    });
  } catch (error) {
    console.error('[Recommendation Controller] Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get personalized recommendations (requires authentication)
 * @route   GET /api/recommendations/personalized
 * @access  Private
 */
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 6;
    
    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 20'
      });
    }
    
    console.log('[Recommendation Controller] Getting personalized recommendations for user:', userId);
    
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);
    
    res.json({
      success: true,
      count: recommendations.length,
      isPersonalized: true,
      data: recommendations
    });
  } catch (error) {
    console.error('[Recommendation Controller] Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get top-selling products
 * @route   GET /api/recommendations/top-selling
 * @access  Public
 */
exports.getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 20'
      });
    }
    
    console.log('[Recommendation Controller] Getting top-selling products, limit:', limit);
    
    const products = await recommendationService.getTopSellingProducts(limit);
    
    res.json({
      success: true,
      count: products.length,
      isPersonalized: false,
      data: products
    });
  } catch (error) {
    console.error('[Recommendation Controller] Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
