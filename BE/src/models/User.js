// User model
// Define your database schema/model here

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password; // Should be hashed
    this.phone = data.phone;
    this.address = data.address;
    this.role = data.role || 'customer'; // customer, admin
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

module.exports = User;
