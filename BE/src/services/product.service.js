const supabase = require('../config/supabase');

// Get all products with optional filters
// exports.getAllProducts = async (filters = {}) => {
//   try {
//     let query = supabase.from('products').select('*, categories(id, name, description)');
    
//     // Filter by active products only (for guest/user view)
//     query = query.eq('is_active', true);
    
//     // Apply filters
//     if (filters.category_id) {
//       query = query.eq('category_id', filters.category_id);
//     }
//     if (filters.brand) {
//       query = query.eq('brand', filters.brand);
//     }
//     if (filters.search) {
//       query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
//     }
//     if (filters.min_price) {
//       query = query.gte('price', filters.min_price);
//     }
//     if (filters.max_price) {
//       query = query.lte('price', filters.max_price);
//     }
    
//     // Sorting
//     const sortBy = filters.sort_by || 'created_at';
//     const sortOrder = filters.sort_order || 'desc';
//     query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
//     const { data, error } = await query;
    
//     if (error) throw error;
//     return data;
//   } catch (error) {
//     throw new Error(`Error fetching products: ${error.message}`);
//   }
// };

// Get product by ID
exports.getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, description)')
      .eq('id', id)
      .eq('is_active', true)
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

// Delete product (smart delete: hard delete if no orders, soft delete if has orders)
exports.deleteProduct = async (id) => {
  try {
    // Check if product exists in any order_items
    const { data: orderItems, error: checkError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (checkError) throw checkError;
    
    // If product has been ordered (exists in order_items), soft delete
    if (orderItems && orderItems.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { deleted: false, soft_deleted: true, message: 'Product deactivated (has existing orders)' };
    } 
    // Otherwise, hard delete
    else {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { deleted: true, soft_deleted: false, message: 'Product permanently deleted' };
    }
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

// Admin-specific: Get all products including inactive ones
exports.getAllProductsAdmin = async (filters = {}) => {
  try {
    let query = supabase.from('products').select('*, categories(id, name, description)');
    
    // Apply filters (but don't filter by is_active - show all)
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
    // Optional filter by is_active status if explicitly provided
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    
    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching products (admin): ${error.message}`);
  }
};

// Admin-specific: Get product by ID including inactive ones
exports.getProductByIdAdmin = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, description)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching product (admin): ${error.message}`);
  }
};

// Get all products with optional filters + sold_qty
exports.getAllProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select('*, categories(id, name, description), order_items(order_id, qty, orders(is_paid))');

    // Apply filters
    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    if (filters.brand) query = query.eq('brand', filters.brand);
    if (filters.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    if (filters.min_price) query = query.gte('price', filters.min_price);
    if (filters.max_price) query = query.lte('price', filters.max_price);

    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    if (error) throw error;

    // Tính sold_qty → tất cả order_items trong order đã tạo
    const productsWithSold = data.map(p => {
      const sold_qty = p.order_items?.reduce((acc, item) => {
        return acc + item.qty; // không check is_paid
      }, 0) || 0;

      return { ...p, sold_qty };
    });

    return productsWithSold;
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};