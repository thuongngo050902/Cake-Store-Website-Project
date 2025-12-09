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
    const newReview = await reviewService.createReview(req.body);
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    next(error);
  }
};

// Update review
exports.updateReview = async (req, res, next) => {
  try {
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
    await reviewService.deleteReview(req.params.id);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
