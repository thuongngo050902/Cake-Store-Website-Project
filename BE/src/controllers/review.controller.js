const reviewService = require('../services/review.service');

// Get all reviews for a product
exports.getReviewsByProduct = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// Get review by ID
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// Create new review
exports.createReview = async (req, res, next) => {
  try {
    // Guard: ensure user is authenticated
    if (!req.user) {
      console.error('[createReview Controller] req.user is missing');
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    // Guard: ensure user ID exists
    if (!req.user.id) {
      console.error('[createReview Controller] req.user.id is missing. User object:', JSON.stringify(req.user));
      return res.status(401).json({ success: false, error: 'User ID missing from token' });
    }
    
    console.log('[createReview Controller] User authenticated:', req.user.id);
    
    // Validate required fields
    const { product_id, rating, comment, name } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error: product_id is required' 
      });
    }
    
    if (!rating) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error: rating is required' 
      });
    }
    
    // Validate rating range (1-5)
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error: rating must be between 1 and 5' 
      });
    }
    
    // Ensure name is never null (required by DB constraint)
    const displayName = (name && name.trim()) ? name.trim() : (req.user.name || 'Anonymous');
    
    // Prepare review data with user_id from authenticated user
    const reviewData = {
      product_id,
      rating: ratingNum,
      comment: comment || null,
      name: displayName,
      user_id: req.user.id
    };
    
    console.log('[createReview Controller] Calling service with data');
    const newReview = await reviewService.createReview(reviewData);
    console.log('[createReview Controller] Review created successfully');
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    // Log full error for debugging
    console.error('[createReview Controller] Caught error:', error);
    console.error('[createReview Controller] Error stack:', error.stack);
    
    // Check if it's a validation error from service layer
    if (error.message && error.message.includes('Validation')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // Database or other server errors - return detailed message in development
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error while creating review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update review
exports.updateReview = async (req, res, next) => {
  try {
    // Guard: ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    // Fetch existing review to check ownership
    const existingReview = await reviewService.getReviewById(req.params.id);
    if (!existingReview) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Check if user owns the review or is admin
    if (existingReview.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. You can only update your own reviews.' 
      });
    }
    
    const updatedReview = await reviewService.updateReview(req.params.id, req.body);
    if (!updatedReview) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    next(error);
  }
};

// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    // Guard: ensure user is authenticated
    if (!req.user || !req.user.id) {
      console.error('[deleteReview Controller] User not authenticated');
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }
    
    // Fetch existing review to check ownership
    const existingReview = await reviewService.getReviewById(req.params.id);
    if (!existingReview) {
      console.warn('[deleteReview Controller] Review not found:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        error: 'Review not found' 
      });
    }
    
    // Check if user owns the review or is admin
    const isOwner = existingReview.user_id === req.user.id;
    const isAdmin = req.user.is_admin === true;
    
    if (!isOwner && !isAdmin) {
      console.warn('[deleteReview Controller] Forbidden - user:', req.user.id, 'review owner:', existingReview.user_id);
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. Not allowed to delete this review.' 
      });
    }
    
    console.log('[deleteReview Controller] Deleting review:', req.params.id, 'by user:', req.user.id, '(owner:', isOwner, ', admin:', isAdmin, ')');
    await reviewService.deleteReview(req.params.id);
    console.log('[deleteReview Controller] Review deleted successfully:', req.params.id);
    
    res.json({ 
      success: true, 
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('[deleteReview Controller] Error deleting review:', error.message);
    console.error('[deleteReview Controller] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
