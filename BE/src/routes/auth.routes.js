const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateProfileUpdate } = require('../middleware/validator.middleware');

// POST register new user
router.post('/register', authController.register);

// POST login
router.post('/login', authController.login);

// GET current user profile (protected - requires authentication)
router.get('/profile', protect, authController.getProfile);

// PUT update user profile (protected - requires authentication + validation)
// SECURITY: Only allows updating name and password. Blocks email, is_admin, role, etc.
router.put('/profile', protect, validateProfileUpdate, authController.updateProfile);

module.exports = router;
