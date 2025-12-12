const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorizeAdmin } = require('../middleware/auth.middleware');

// GET all products (with filters, search, sort)
router.get('/', productController.getAllProducts);

// GET single product by ID
router.get('/:id', productController.getProductById);

// POST create new product (protected - admin only)
router.post('/', protect, authorizeAdmin, productController.createProduct);

// PUT update product (protected - admin only)
router.put('/:id', protect, authorizeAdmin, productController.updateProduct);

// DELETE product (protected - admin only)
router.delete('/:id', protect, authorizeAdmin, productController.deleteProduct);

module.exports = router;
