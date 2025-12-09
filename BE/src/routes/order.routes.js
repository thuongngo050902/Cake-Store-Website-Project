const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// GET all orders (user gets their own, admin gets all)
router.get('/', orderController.getAllOrders);

// GET single order by ID
router.get('/:id', orderController.getOrderById);

// POST create new order (requires authentication)
router.post('/', orderController.createOrder);

// PUT update order (admin only)
router.put('/:id', orderController.updateOrder);

// PUT update order to paid
router.put('/:id/pay', orderController.updateOrderToPaid);

// PUT update order to delivered (admin only)
router.put('/:id/deliver', orderController.updateOrderToDelivered);

// DELETE order (admin only)
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
