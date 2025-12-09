// Category model - Supabase table: categories
// Schema: categories(id, name, description, created_at, updated_at)
class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

module.exports = Category;
