const cakeService = require('../services/cake.service');

// Get all cakes
exports.getAllCakes = async (req, res, next) => {
  try {
    const cakes = await cakeService.getAllCakes();
    res.json({ success: true, data: cakes });
  } catch (error) {
    next(error);
  }
};

// Get cake by ID
exports.getCakeById = async (req, res, next) => {
  try {
    const cake = await cakeService.getCakeById(req.params.id);
    if (!cake) {
      return res.status(404).json({ success: false, error: 'Cake not found' });
    }
    res.json({ success: true, data: cake });
  } catch (error) {
    next(error);
  }
};

// Create new cake
exports.createCake = async (req, res, next) => {
  try {
    const newCake = await cakeService.createCake(req.body);
    res.status(201).json({ success: true, data: newCake });
  } catch (error) {
    next(error);
  }
};

// Update cake
exports.updateCake = async (req, res, next) => {
  try {
    const updatedCake = await cakeService.updateCake(req.params.id, req.body);
    if (!updatedCake) {
      return res.status(404).json({ success: false, error: 'Cake not found' });
    }
    res.json({ success: true, data: updatedCake });
  } catch (error) {
    next(error);
  }
};

// Delete cake
exports.deleteCake = async (req, res, next) => {
  try {
    const deleted = await cakeService.deleteCake(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Cake not found' });
    }
    res.json({ success: true, message: 'Cake deleted successfully' });
  } catch (error) {
    next(error);
  }
};
