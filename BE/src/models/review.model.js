// Review model - Supabase table: reviews
// Schema: reviews(id, product_id, user_id, name, rating, comment, created_at, updated_at)
class Review {
  constructor(data) {
    this.id = data.id;
    this.product_id = data.product_id;
    this.user_id = data.user_id; // User who wrote the review (FK to users)
    this.name = data.name; // reviewer name
    this.rating = data.rating; // 1-5
    this.comment = data.comment;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

module.exports = Review;
