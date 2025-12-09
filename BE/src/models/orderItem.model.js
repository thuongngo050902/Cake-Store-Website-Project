// OrderItem model - Supabase table: order_items
// Schema: order_items(id, order_id, product_id, name, qty, image, price)
class OrderItem {
  constructor(data) {
    this.id = data.id;
    this.order_id = data.order_id;
    this.product_id = data.product_id;
    this.name = data.name;
    this.qty = data.qty;
    this.image = data.image;
    this.price = data.price; // Price at time of order
  }
}

module.exports = OrderItem;
