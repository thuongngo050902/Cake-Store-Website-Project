const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// GET all products (with filters, search, sort)
router.get('/', productController.getAllProducts);

// GET single product by ID
router.get('/:id', productController.getProductById);

// POST create new product (admin only)
router.post('/', productController.createProduct);

// PUT update product (admin only)
router.put('/:id', productController.updateProduct);

// DELETE product (admin only)
router.delete('/:id', productController.deleteProduct);

module.exports = router;
