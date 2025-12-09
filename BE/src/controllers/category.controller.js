const categoryService = require('../services/category.service');

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const products = await categoryService.getProductsByCategory(req.params.id);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// Create new category (admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    next(error);
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    if (!updatedCategory) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
