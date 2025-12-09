const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// GET all categories
router.get('/', categoryController.getAllCategories);

// GET single category by ID
router.get('/:id', categoryController.getCategoryById);

// GET products by category ID
router.get('/:id/products', categoryController.getProductsByCategory);

// POST create new category (admin only)
router.post('/', categoryController.createCategory);

// PUT update category (admin only)
router.put('/:id', categoryController.updateCategory);

// DELETE category (admin only)
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
