// User model - Supabase table: users
// Schema: users(id, name, email, password, is_admin, created_at, updated_at)
class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password; // hashed password
    this.is_admin = data.is_admin || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
  
  // Remove sensitive data
  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}

module.exports = User;
