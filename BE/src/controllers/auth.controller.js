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
    // Safety check: ensure req.user is defined
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required. User not found in request.' 
      });
    }
    
    const user = await authService.getUserById(req.user.id);
    // Remove password from response (additional safety)
    const { password, ...userWithoutPassword } = user || {};
    res.json({ success: true, data: userWithoutPassword });
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
