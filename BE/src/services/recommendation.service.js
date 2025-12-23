const supabase = require('../config/supabase');

/**
 * Get personalized product recommendations for logged-in users
 * Based on user's most purchased category
 * @param {string} userId - User ID
 * @param {number} limit - Number of recommendations to return (default: 6)
 * @returns {Promise<Array>} Recommended products
 */
exports.getPersonalizedRecommendations = async (userId, limit = 6) => {
  try {
    console.log('[Recommendation Service] Getting personalized recommendations for user:', userId);
    
    // Step 1: Get user's order history with order items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_items (
          product_id,
          qty
        )
      `)
      .eq('user_id', userId)
      .eq('is_paid', true); // Only consider paid orders
    
    if (ordersError) throw ordersError;
    
    if (!orders || orders.length === 0) {
      console.log('[Recommendation Service] No order history found, falling back to top-selling products');
      return await exports.getTopSellingProducts(limit);
    }
    
    // Step 2: Extract all product IDs from order items
    const productIds = [];
    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          productIds.push(item.product_id);
        });
      }
    });
    
    if (productIds.length === 0) {
      console.log('[Recommendation Service] No products in order history, falling back to top-selling');
      return await exports.getTopSellingProducts(limit);
    }
    
    // Step 3: Get products and their categories
    const { data: purchasedProducts, error: productsError } = await supabase
      .from('products')
      .select('id, category_id')
      .in('id', productIds);
    
    if (productsError) throw productsError;
    
    // Step 4: Count category frequencies
    const categoryCount = {};
    purchasedProducts.forEach(product => {
      if (product.category_id) {
        categoryCount[product.category_id] = (categoryCount[product.category_id] || 0) + 1;
      }
    });
    
    // Step 5: Find most purchased category
    let mostPurchasedCategory = null;
    let maxCount = 0;
    
    for (const [categoryId, count] of Object.entries(categoryCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostPurchasedCategory = categoryId;
      }
    }
    
    if (!mostPurchasedCategory) {
      console.log('[Recommendation Service] No category found, falling back to top-selling');
      return await exports.getTopSellingProducts(limit);
    }
    
    console.log('[Recommendation Service] Most purchased category:', mostPurchasedCategory, 'with', maxCount, 'purchases');
    
    // Step 6: Get recommended products from that category (exclude already purchased)
    const { data: recommendations, error: recError } = await supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('category_id', mostPurchasedCategory)
      .eq('is_active', true)
      .gt('count_in_stock', 0) // Only in-stock products
      .not('id', 'in', `(${productIds.join(',')})`) // Exclude already purchased
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (recError) throw recError;
    
    // If not enough recommendations from favorite category, add top-selling
    if (recommendations.length < limit) {
      console.log('[Recommendation Service] Not enough products in favorite category, adding top-selling');
      const topSelling = await exports.getTopSellingProducts(limit - recommendations.length);
      
      // Merge and deduplicate
      const existingIds = new Set(recommendations.map(p => p.id));
      topSelling.forEach(product => {
        if (!existingIds.has(product.id) && recommendations.length < limit) {
          recommendations.push(product);
        }
      });
    }
    
    console.log('[Recommendation Service] Returning', recommendations.length, 'personalized recommendations');
    return recommendations;
  } catch (error) {
    console.error('[Recommendation Service] Error getting personalized recommendations:', error.message);
    throw new Error(`Error getting personalized recommendations: ${error.message}`);
  }
};

/**
 * Get top-selling products for non-logged-in users
 * Based on total quantity sold across all orders
 * @param {number} limit - Number of products to return (default: 6)
 * @returns {Promise<Array>} Top-selling products
 */
exports.getTopSellingProducts = async (limit = 6) => {
  try {
    console.log('[Recommendation Service] Getting top-selling products');
    
    // Step 1: Get all order items with aggregated quantities
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, qty');
    
    if (itemsError) throw itemsError;
    
    // Step 2: Aggregate quantities by product
    const productSales = {};
    
    if (orderItems && orderItems.length > 0) {
      orderItems.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = 0;
        }
        productSales[item.product_id] += item.qty;
      });
    }
    
    // Step 3: Sort products by total quantity sold
    const sortedProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 2) // Get more than needed in case some are inactive
      .map(([productId]) => productId);
    
    // Step 4: Fetch product details
    let query = supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('is_active', true)
      .gt('count_in_stock', 0);
    
    if (sortedProducts.length > 0) {
      query = query.in('id', sortedProducts);
    }
    
    const { data: products, error: productsError } = await query
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (productsError) throw productsError;
    
    // If not enough sold products, add high-rated products
    if (!products || products.length < limit) {
      const { data: highRated, error: ratedError } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('is_active', true)
        .gt('count_in_stock', 0)
        .order('rating', { ascending: false })
        .order('num_reviews', { ascending: false })
        .limit(limit);
      
      if (ratedError) throw ratedError;
      
      console.log('[Recommendation Service] Returning', (highRated?.length || 0), 'top-rated products');
      return highRated || [];
    }
    
    console.log('[Recommendation Service] Returning', products.length, 'top-selling products');
    return products;
  } catch (error) {
    console.error('[Recommendation Service] Error getting top-selling products:', error.message);
    throw new Error(`Error getting top-selling products: ${error.message}`);
  }
};

/**
 * Get recommendations based on user authentication status
 * @param {string|null} userId - User ID if logged in, null otherwise
 * @param {number} limit - Number of recommendations to return (default: 6)
 * @returns {Promise<Array>} Recommended products
 */
exports.getRecommendations = async (userId = null, limit = 6) => {
  try {
    if (userId) {
      return await exports.getPersonalizedRecommendations(userId, limit);
    } else {
      return await exports.getTopSellingProducts(limit);
    }
  } catch (error) {
    console.error('[Recommendation Service] Error getting recommendations:', error.message);
    throw new Error(`Error getting recommendations: ${error.message}`);
  }
};
