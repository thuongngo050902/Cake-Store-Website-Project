const supabase = require('../config/supabase');
const config = require('../config');
const { toVND, formatVND } = require('../utils/money');

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

// Create new order with items (with server-side price calculation)
exports.createOrder = async (orderData) => {
  try {
    const { order_items, user_id, payment_method, shipping_address, shipping_city, shipping_postal_code, shipping_country } = orderData;
    
    console.log('[createOrder Service] Starting order creation for user:', user_id);
    console.log('[createOrder Service] Processing', order_items.length, 'items');
    
    // Validate and fetch products, calculate prices server-side (VND integers)
    const validatedItems = [];
    let itemsPriceVND = 0;
    
    for (const item of order_items) {
      // Fetch product from database to get current price
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, count_in_stock, image')
        .eq('id', item.product_id)
        .single();
      
      if (productError || !product) {
        console.error('[createOrder Service] Product not found:', item.product_id);
        throw new Error(`Validation error: Product not found: ${item.product_id}`);
      }
      
      // Check stock availability
      if (product.count_in_stock < item.qty) {
        console.warn('[createOrder Service] Insufficient stock for product:', product.id, 'requested:', item.qty, 'available:', product.count_in_stock);
        throw new Error(`Validation error: Insufficient stock for product: ${product.name}. Available: ${product.count_in_stock}`);
      }
      
      // Use server-side price (DO NOT trust client) - VND integer
      const unitPriceVND = toVND(product.price);
      const lineTotalVND = unitPriceVND * item.qty;
      
      // Log if client submitted price differs from DB price
      if (item.price && Math.abs(Number(item.price) - Number(product.price)) > 0.01) {
        console.warn('[createOrder Service] Price mismatch detected!');
        console.warn('[createOrder Service] Product:', product.id, 'Client price:', item.price, 'VND, DB price:', product.price, 'VND');
        console.warn('[createOrder Service] Using DB price for security');
      }
      
      itemsPriceVND += lineTotalVND;
      
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        qty: item.qty,
        image: product.image || '',
        price: product.price, // Use DB price (integer VND)
        price_vnd: unitPriceVND,
        line_total_vnd: lineTotalVND
      });
      
      console.log('[createOrder Service] Item validated:', product.name, 'qty:', item.qty, 'unit price:', formatVND(product.price), 'line total:', formatVND(lineTotalVND));
    }
    
    // Calculate tax (using integer arithmetic on VND)
    const taxPriceVND = Math.round(itemsPriceVND * config.taxRate);
    
    // Calculate shipping (VND integers)
    let shippingPriceVND;
    
    if (config.enableFreeShipping && itemsPriceVND >= config.freeShippingThreshold) {
      // Free shipping if enabled and order meets threshold
      shippingPriceVND = 0;
    } else {
      // Charge standard shipping price (already in VND)
      shippingPriceVND = toVND(config.shippingPrice);
    }
    
    // Calculate total (all VND integers)
    const totalPriceVND = itemsPriceVND + taxPriceVND + shippingPriceVND;
    
    console.log('[createOrder Service] Price calculation (VND):');
    console.log('[createOrder Service]   Items:', formatVND(itemsPriceVND));
    console.log('[createOrder Service]   Tax:', formatVND(taxPriceVND), `(${config.taxRate * 100}%)`);
    console.log('[createOrder Service]   Shipping:', formatVND(shippingPriceVND), 
      config.enableFreeShipping && itemsPriceVND >= config.freeShippingThreshold 
        ? '(FREE - over threshold)' 
        : config.enableFreeShipping 
          ? `(under threshold of ${formatVND(config.freeShippingThreshold)})` 
          : '');
    console.log('[createOrder Service]   Total:', formatVND(totalPriceVND));
    
    // Create order record (store VND integers)
    const orderRecord = {
      user_id,
      payment_method,
      items_price: itemsPriceVND,
      tax_price: taxPriceVND,
      shipping_price: shippingPriceVND,
      total_price: totalPriceVND,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_country,
      is_paid: false,
      is_delivered: false
    };
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderRecord])
      .select()
      .single();
    
    if (orderError) {
      console.error('[createOrder Service] Error creating order:', orderError.message);
      throw orderError;
    }
    
    console.log('[createOrder Service] Order record created:', order.id);
    
    // Create order items
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('[createOrder Service] Error creating order items:', itemsError.message);
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }
    
    console.log('[createOrder Service] Order items created:', orderItems.length);
    
    // Update product stock (decrease count_in_stock)
    for (const item of validatedItems) {
      // Fetch current stock first
      const { data: currentProduct } = await supabase
        .from('products')
        .select('count_in_stock')
        .eq('id', item.product_id)
        .single();
      
      if (currentProduct) {
        const newStock = currentProduct.count_in_stock - item.qty;
        const { error: stockError } = await supabase
          .from('products')
          .update({ count_in_stock: newStock })
          .eq('id', item.product_id);
        
        if (stockError) {
          console.error('[createOrder Service] Error updating stock for product:', item.product_id, stockError.message);
          // Continue - don't fail order creation if stock update fails (can be reconciled later)
        } else {
          console.log('[createOrder Service] Stock updated for product:', item.product_id, 'reduced by:', item.qty, 'new stock:', newStock);
        }
      }
    }
    
    // Return order with items
    const finalOrder = await exports.getOrderById(order.id, null, true);
    console.log('[createOrder Service] Order creation completed successfully');
    return finalOrder;
  } catch (error) {
    console.error('[createOrder Service] Error in createOrder:', error.message);
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
