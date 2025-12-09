const authService = require('../services/auth.service');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateUser(req.user.id, req.body);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};
