const supabase = require('../config/supabase');

// Get all orders (admin) or user's orders
exports.getAllOrders = async (userId = null, isAdmin = false) => {
  try {
    let query = supabase
      .from('orders')
      .select('*, users(id, name, email)');
    
    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching orders: ${error.message}`);
  }
};

// Get order by ID with order items
exports.getOrderById = async (id, userId = null, isAdmin = false) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        users(id, name, email),
        order_items(*)
      `)
      .eq('id', id);
    
    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching order: ${error.message}`);
  }
};

// Create new order with items
exports.createOrder = async (orderData) => {
  try {
    const { order_items, ...orderInfo } = orderData;
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderInfo])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    if (order_items && order_items.length > 0) {
      const items = order_items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items);
      
      if (itemsError) throw itemsError;
    }
    
    // Return order with items
    return await exports.getOrderById(order.id, null, true);
  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
};

// Update order
exports.updateOrder = async (id, orderData) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error updating order: ${error.message}`);
  }
};

// Update order to paid
exports.updateOrderToPaid = async (id, paymentResult) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error updating order to paid: ${error.message}`);
  }
};

// Update order to delivered
exports.updateOrderToDelivered = async (id) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        is_delivered: true,
        delivered_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error updating order to delivered: ${error.message}`);
  }
};

// Delete order
exports.deleteOrder = async (id) => {
  try {
    // Delete order items first (foreign key constraint)
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);
    
    // Delete order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    throw new Error(`Error deleting order: ${error.message}`);
  }
};
