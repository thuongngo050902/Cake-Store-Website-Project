const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET all users
router.get('/', userController.getAllUsers);

// GET single user by ID
router.get('/:id', userController.getUserById);

// POST create new user (register)
router.post('/register', userController.register);

// POST login
router.post('/login', userController.login);

// PUT update user
router.put('/:id', userController.updateUser);

// DELETE user
router.delete('/:id', userController.deleteUser);

module.exports = router;
