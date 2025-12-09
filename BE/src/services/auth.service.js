const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Register new user
exports.register = async (userData) => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', userData.email)
      .single();
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        is_admin: userData.is_admin || false
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Remove password from response
    const { password, ...userWithoutPassword } = data;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: data.id, email: data.email, is_admin: data.is_admin },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    return { user: userWithoutPassword, token };
  } catch (error) {
    throw new Error(`Error registering user: ${error.message}`);
  }
};

// Login user
exports.login = async ({ email, password }) => {
  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    return { user: userWithoutPassword, token };
  } catch (error) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

// Get user by ID
exports.getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, is_admin, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

// Update user
exports.updateUser = async (id, userData) => {
  try {
    const updateData = { ...userData };
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, is_admin, created_at, updated_at')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};
