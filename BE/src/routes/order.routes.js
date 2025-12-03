const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// GET all orders
router.get('/', orderController.getAllOrders);

// GET single order by ID
router.get('/:id', orderController.getOrderById);

// GET orders by user ID
router.get('/user/:userId', orderController.getOrdersByUserId);

// POST create new order
router.post('/', orderController.createOrder);

// PUT update order status
router.put('/:id', orderController.updateOrder);

// DELETE order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
