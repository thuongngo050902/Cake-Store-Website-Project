const orderService = require('../services/order.service');

// Get all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Get orders by user ID
exports.getOrdersByUserId = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUserId(req.params.userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const newOrder = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    next(error);
  }
};

// Update order
exports.updateOrder = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
    if (!updatedOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Delete order
exports.deleteOrder = async (req, res, next) => {
  try {
    const deleted = await orderService.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
