const orderService = require('../services/order.service');

// Get all orders (admin only - gets all orders)
exports.getAllOrders = async (req, res, next) => {
  try {
    // Guard: ensure user is admin
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. Admin privileges required.' 
      });
    }
    
    const orders = await orderService.getAllOrders(null, true);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Get user's own orders (authenticated user)
exports.getMyOrders = async (req, res, next) => {
  try {
    // Guard: ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    const userId = req.user.id;
    const orders = await orderService.getAllOrders(userId, false);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Get order by ID (owner or admin)
exports.getOrderById = async (req, res, next) => {
  try {
    // Guard: ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    const userId = req.user.id;
    const isAdmin = req.user.is_admin || false;
    
    // First fetch order without filtering to check ownership
    const order = await orderService.getOrderById(req.params.id, null, true);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check access: must be owner or admin
    if (order.user_id !== userId && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. You can only view your own orders.' 
      });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    // Guard: ensure user is authenticated
    if (!req.user || !req.user.id) {
      console.error('[createOrder Controller] User not authenticated');
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    
    console.log('[createOrder Controller] User authenticated:', req.user.id);
    
    // Validate request body
    const { order_items, payment_method, shipping_address, shipping_city, shipping_postal_code, shipping_country } = req.body;
    
    // Validate order_items
    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error: order_items must be a non-empty array' 
      });
    }
    
    // Validate each order item has required fields
    for (let i = 0; i < order_items.length; i++) {
      const item = order_items[i];
      if (!item.product_id) {
        return res.status(400).json({ 
          success: false, 
          error: `Validation error: order_items[${i}].product_id is required` 
        });
      }
      if (!item.qty || item.qty < 1) {
        return res.status(400).json({ 
          success: false, 
          error: `Validation error: order_items[${i}].qty must be >= 1` 
        });
      }
    }
    
    // Validate shipping information
    if (!shipping_address || !shipping_city || !shipping_postal_code || !shipping_country) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error: shipping address fields are required' 
      });
    }
    
    const orderData = {
      order_items,
      payment_method: payment_method || 'PayPal',
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_country,
      user_id: req.user.id
    };
    
    console.log('[createOrder Controller] Creating order with', order_items.length, 'items');
    const newOrder = await orderService.createOrder(orderData);
    console.log('[createOrder Controller] Order created successfully:', newOrder.id);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('[createOrder Controller] Error:', error.message);
    console.error('[createOrder Controller] Stack:', error.stack);
    
    // Check for validation errors
    if (error.message && (error.message.includes('Validation error') || error.message.includes('not found'))) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error while creating order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update order
exports.updateOrder = async (req, res, next) => {
  try {
    // Guard: ensure user is admin
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. Admin privileges required.' 
      });
    }
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
    // Guard: ensure user is admin
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. Admin privileges required.' 
      });
    }
    const updatedOrder = await orderService.updateOrderToPaid(req.params.id, req.body);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Update order to delivered
exports.updateOrderToDelivered = async (req, res, next) => {
  try {
    // Guard: ensure user is admin
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. Admin privileges required.' 
      });
    }
    const updatedOrder = await orderService.updateOrderToDelivered(req.params.id);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// Delete order
exports.deleteOrder = async (req, res, next) => {
  try {
    // Guard: ensure user is admin
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden. Admin privileges required.' 
      });
    }
    await orderService.deleteOrder(req.params.id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};
