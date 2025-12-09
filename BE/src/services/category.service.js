const supabase = require('../config/supabase');

// Get all categories
exports.getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
  }
};

// Get category by ID
exports.getCategoryById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching category: ${error.message}`);
  }
};

// Get products by category ID
exports.getProductsByCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching products by category: ${error.message}`);
  }
};

// Create new category
exports.createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error creating category: ${error.message}`);
  }
};

// Update category
exports.updateCategory = async (id, categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error updating category: ${error.message}`);
  }
};

// Delete category
exports.deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    throw new Error(`Error deleting category: ${error.message}`);
  }
};
