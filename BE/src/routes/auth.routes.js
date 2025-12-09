const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST register new user
router.post('/register', authController.register);

// POST login
router.post('/login', authController.login);

// GET current user profile (requires authentication)
router.get('/profile', authController.getProfile);

// PUT update user profile (requires authentication)
router.put('/profile', authController.updateProfile);

module.exports = router;
