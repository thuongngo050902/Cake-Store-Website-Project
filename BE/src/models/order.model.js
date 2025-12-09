// Order model - Supabase table: orders
// Schema: orders(id, user_id, payment_method, items_price, tax_price, shipping_price, total_price, is_paid, paid_at, is_delivered, delivered_at, shipping_address, shipping_city, shipping_postal_code, shipping_country, created_at, updated_at)
class Order {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.payment_method = data.payment_method;
    this.items_price = data.items_price;
    this.tax_price = data.tax_price;
    this.shipping_price = data.shipping_price;
    this.total_price = data.total_price;
    this.is_paid = data.is_paid || false;
    this.paid_at = data.paid_at;
    this.is_delivered = data.is_delivered || false;
    this.delivered_at = data.delivered_at;
    this.shipping_address = data.shipping_address;
    this.shipping_city = data.shipping_city;
    this.shipping_postal_code = data.shipping_postal_code;
    this.shipping_country = data.shipping_country;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

module.exports = Order;
