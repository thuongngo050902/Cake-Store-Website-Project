// Review model - Supabase table: reviews
// Schema: reviews(id, product_id, name, rating, comment, created_at, updated_at)
class Review {
  constructor(data) {
    this.id = data.id;
    this.product_id = data.product_id;
    this.name = data.name; // reviewer name
    this.rating = data.rating; // 1-5
    this.comment = data.comment;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

module.exports = Review;
