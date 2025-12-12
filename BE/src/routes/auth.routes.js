const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// POST register new user
router.post('/register', authController.register);

// POST login
router.post('/login', authController.login);

// GET current user profile (protected - requires authentication)
router.get('/profile', protect, authController.getProfile);

// PUT update user profile (protected - requires authentication)
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
