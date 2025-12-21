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
    
    // Create user - SECURITY: is_admin defaults to false, cannot be set during registration
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        is_admin: false  // SECURITY: Always false on registration. Admins must be promoted by existing admins.
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

// Update user profile - WHITELIST approach for security
exports.updateUser = async (id, userData) => {
  try {
    // SECURITY: Whitelist only safe fields that users can update
    const updateData = {};
    
    // Only allow these fields to be updated by regular users
    if (userData.name !== undefined) {
      // Validate name
      const trimmedName = userData.name.trim();
      if (!trimmedName) {
        throw new Error('Name cannot be empty');
      }
      if (trimmedName.length > 100) {
        throw new Error('Name is too long (max 100 characters)');
      }
      updateData.name = trimmedName;
    }
    
    if (userData.password !== undefined) {
      // Validate password
      if (!userData.password || userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (userData.password.length > 128) {
        throw new Error('Password is too long (max 128 characters)');
      }
      // Hash password
      updateData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // SECURITY: Block updates to sensitive fields even if client sends them
    // Blocked: is_admin, role, email, id, created_at, updated_at
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update. Only name and password can be updated.');
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
