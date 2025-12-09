const supabase = require('../config/supabase');

// Get all products with optional filters
exports.getAllProducts = async (filters = {}) => {
  try {
    let query = supabase.from('products').select('*, categories(id, name, description)');
    
    // Apply filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.min_price) {
      query = query.gte('price', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('price', filters.max_price);
    }
    
    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

// Get product by ID
exports.getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, description)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

// Create new product
exports.createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

// Update product
exports.updateProduct = async (id, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// Delete product
exports.deleteProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};
