// Product model - Supabase table: products
// Schema: products(id, name, image, brand, price, category_id, count_in_stock, description, rating, num_reviews, is_active, created_at, updated_at)
class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
    this.brand = data.brand;
    this.price = data.price;
    this.category_id = data.category_id;
    this.count_in_stock = data.count_in_stock || 0;
    this.description = data.description;
    this.rating = data.rating || 0;
    this.num_reviews = data.num_reviews || 0;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

module.exports = Product;
