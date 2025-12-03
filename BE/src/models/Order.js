// Order model
// Define your database schema/model here

class Order {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.items = data.items || []; // Array of { cakeId, quantity, price }
    this.totalAmount = data.totalAmount;
    this.status = data.status || 'pending'; // pending, processing, completed, cancelled
    this.shippingAddress = data.shippingAddress;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus || 'unpaid'; // unpaid, paid
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

module.exports = Order;
