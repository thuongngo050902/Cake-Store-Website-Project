const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, authorizeAdmin } = require('../middleware/auth.middleware');

// GET all categories
router.get('/', categoryController.getAllCategories);

// GET single category by ID
router.get('/:id', categoryController.getCategoryById);

// GET products by category ID
router.get('/:id/products', categoryController.getProductsByCategory);

// POST create new category (protected - admin only)
router.post('/', protect, authorizeAdmin, categoryController.createCategory);

// PUT update category (protected - admin only)
router.put('/:id', protect, authorizeAdmin, categoryController.updateCategory);

// DELETE category (protected - admin only)
router.delete('/:id', protect, authorizeAdmin, categoryController.deleteCategory);

module.exports = router;
