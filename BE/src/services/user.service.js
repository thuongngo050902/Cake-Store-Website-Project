// User service - Business logic layer

// Mock data for now - replace with actual database calls
let users = [];

exports.getAllUsers = async () => {
  // TODO: Replace with database query
  // Remove passwords from response
  return users.map(({ password, ...user }) => user);
};

exports.getUserById = async (id) => {
  // TODO: Replace with database query
  const user = users.find(user => user.id === parseInt(id));
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

exports.register = async (userData) => {
  // TODO: Replace with database insert
  // TODO: Hash password before storing
  const newUser = {
    id: users.length + 1,
    ...userData,
    createdAt: new Date()
  };
  users.push(newUser);
  
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

exports.login = async ({ email, password }) => {
  // TODO: Replace with database query
  // TODO: Verify hashed password
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // TODO: Generate JWT token
  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token: 'mock-jwt-token'
  };
};

exports.updateUser = async (id, userData) => {
  // TODO: Replace with database update
  const index = users.findIndex(user => user.id === parseInt(id));
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...userData };
  const { password, ...userWithoutPassword } = users[index];
  return userWithoutPassword;
};

exports.deleteUser = async (id) => {
  // TODO: Replace with database delete
  const index = users.findIndex(user => user.id === parseInt(id));
  if (index === -1) return false;
  
  users.splice(index, 1);
  return true;
};
