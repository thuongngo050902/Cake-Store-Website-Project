const orderService = require('../services/order.service');

// Get all orders (admin gets all, user gets their own)
exports.getAllOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.is_admin || false;
    const orders = await orderService.getAllOrders(userId, isAdmin);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.is_admin || false;
    const order = await orderService.getOrderById(req.params.id, userId, isAdmin);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const orderData = {
      ...req.body,
      user_id: req.user?.id // From auth middleware
    };
    const newOrder = await orderService.createOrder(orderData);
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

// Update order to paid
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrderToPaid(req.params.id, req.body);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Update order to delivered
exports.updateOrderToDelivered = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrderToDelivered(req.params.id);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Delete order
exports.deleteOrder = async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
