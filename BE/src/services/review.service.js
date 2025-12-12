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
    // Validate required fields at service layer (defensive)
    if (!reviewData.product_id) {
      throw new Error('Validation error: product_id is required');
    }
    if (!reviewData.rating) {
      throw new Error('Validation error: rating is required');
    }
    if (!reviewData.user_id) {
      throw new Error('Validation error: user_id is required');
    }
    if (!reviewData.name) {
      throw new Error('Validation error: name is required');
    }
    
    console.log('[createReview] Creating review for product:', reviewData.product_id, 'by user:', reviewData.user_id);
    
    // Insert review into database
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select('*')
      .single();
    
    if (error) {
      // Log full Supabase error with all properties for debugging
      console.error('[createReview] Supabase error (full):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('[createReview] Error details - code:', error.code, 'message:', error.message, 'details:', error.details, 'hint:', error.hint);
      
      // Handle specific database errors
      if (error.code === '23505') {
        throw new Error('Validation error: You have already reviewed this product');
      }
      if (error.code === '23503') {
        throw new Error('Validation error: Product not found or invalid user_id');
      }
      if (error.code === '23502') {
        throw new Error('Validation error: Required field is missing (NOT NULL constraint)');
      }
      if (error.code === '42703') {
        throw new Error('Database error: Column does not exist. Check reviews table schema.');
      }
      if (error.code === 'PGRST116') {
        throw new Error('Database error: Row Level Security policy violation or permission denied');
      }
      
      // Return detailed error message for debugging
      throw new Error(`Database error: ${error.message} (code: ${error.code}, details: ${error.details || 'none'})`);
    }
    
    if (!data) {
      console.error('[createReview] No data returned from insert');
      throw new Error('Database error: Failed to create review');
    }
    
    console.log('[createReview] Review created successfully, ID:', data.id);
    
    // Update product rating and num_reviews
    try {
      await this.updateProductRating(reviewData.product_id);
      console.log('[createReview] Product rating updated for product:', reviewData.product_id);
    } catch (ratingError) {
      // Log but don't fail the request if rating update fails
      console.error('[createReview] Failed to update product rating:', ratingError.message);
    }
    
    return data;
  } catch (error) {
    // Re-throw validation errors as-is
    if (error.message.includes('Validation error')) {
      throw error;
    }
    // Wrap other errors
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
