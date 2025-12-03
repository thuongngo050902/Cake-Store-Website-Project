const express = require('express');
const router = express.Router();
const cakeController = require('../controllers/cake.controller');

// GET all cakes
router.get('/', cakeController.getAllCakes);

// GET single cake by ID
router.get('/:id', cakeController.getCakeById);

// POST create new cake
router.post('/', cakeController.createCake);

// PUT update cake
router.put('/:id', cakeController.updateCake);

// DELETE cake
router.delete('/:id', cakeController.deleteCake);

module.exports = router;
