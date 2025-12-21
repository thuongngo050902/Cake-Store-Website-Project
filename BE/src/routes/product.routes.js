const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorizeAdmin } = require('../middleware/auth.middleware');

// GET all products (with filters, search, sort) - public, shows only active products
router.get('/', productController.getAllProducts);

// GET all products for admin (includes inactive products)
router.get('/admin/all', protect, authorizeAdmin, productController.getAllProductsAdmin);

// GET single product by ID - public, shows only active products
router.get('/:id', productController.getProductById);

// GET single product by ID for admin (includes inactive products)
router.get('/admin/:id', protect, authorizeAdmin, productController.getProductByIdAdmin);

// POST create new product (protected - admin only)
router.post('/', protect, authorizeAdmin, productController.createProduct);

// PUT update product (protected - admin only)
router.put('/:id', protect, authorizeAdmin, productController.updateProduct);

// DELETE product (protected - admin only)
router.delete('/:id', protect, authorizeAdmin, productController.deleteProduct);

module.exports = router;
