const supabase = require('../config/supabase');

// Get all reviews for a product
exports.getReviewsByProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
};

// Get review by ID
exports.getReviewById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(id, name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching review: ${error.message}`);
  }
};

// Create new review
exports.createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update product rating and num_reviews
    await this.updateProductRating(reviewData.product_id);
    
    return data;
  } catch (error) {
    throw new Error(`Error creating review: ${error.message}`);
  }
};

// Update review
exports.updateReview = async (id, reviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update product rating
    if (data) {
      await this.updateProductRating(data.product_id);
    }
    
    return data;
  } catch (error) {
    throw new Error(`Error updating review: ${error.message}`);
  }
};

// Delete review
exports.deleteReview = async (id) => {
  try {
    // Get product_id before deleting
    const { data: review } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', id)
      .single();
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Update product rating
    if (review) {
      await this.updateProductRating(review.product_id);
    }
    
    return true;
  } catch (error) {
    throw new Error(`Error deleting review: ${error.message}`);
  }
};

// Update product rating and num_reviews
exports.updateProductRating = async (productId) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);
    
    if (error) throw error;
    
    const numReviews = reviews.length;
    const rating = numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : 0;
    
    await supabase
      .from('products')
      .update({ 
        rating: parseFloat(rating.toFixed(1)), 
        num_reviews: numReviews 
      })
      .eq('id', productId);
    
    return { rating, num_reviews: numReviews };
  } catch (error) {
    throw new Error(`Error updating product rating: ${error.message}`);
  }
};
