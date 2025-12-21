const productService = require('../services/product.service');

// Get all products with filters
exports.getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      brand: req.query.brand,
      search: req.query.search,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    };
    
    const products = await productService.getAllProducts(filters);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// Create new product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ 
      success: true, 
      message: result.message,
      deleted: result.deleted,
      soft_deleted: result.soft_deleted
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all products including inactive ones
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      brand: req.query.brand,
      search: req.query.search,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    };
    
    const products = await productService.getAllProductsAdmin(filters);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// Admin: Get product by ID including inactive ones
exports.getProductByIdAdmin = async (req, res, next) => {
  try {
    const product = await productService.getProductByIdAdmin(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};
