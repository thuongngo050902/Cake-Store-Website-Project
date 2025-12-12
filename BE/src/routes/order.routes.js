const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorizeAdmin } = require('../middleware/auth.middleware');

// POST create new order (protected - requires authentication)
router.post('/', protect, orderController.createOrder);

// GET user's own orders (protected - requires authentication)
router.get('/my', protect, orderController.getMyOrders);

// GET all orders (protected - admin only)
router.get('/', protect, authorizeAdmin, orderController.getAllOrders);

// GET single order by ID (protected - owner or admin)
router.get('/:id', protect, orderController.getOrderById);

// PUT update order (protected - admin only)
router.put('/:id', protect, authorizeAdmin, orderController.updateOrder);

// PUT update order to paid (protected - admin only)
router.put('/:id/pay', protect, authorizeAdmin, orderController.updateOrderToPaid);

// PUT update order to delivered (protected - admin only)
router.put('/:id/deliver', protect, authorizeAdmin, orderController.updateOrderToDelivered);

// DELETE order (protected - admin only)
router.delete('/:id', protect, authorizeAdmin, orderController.deleteOrder);

module.exports = router;
