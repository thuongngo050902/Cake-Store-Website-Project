// Validation middleware

exports.validateCake = (req, res, next) => {
  const { name, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ 
      error: 'Name and price are required' 
    });
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ 
      error: 'Price must be a positive number' 
    });
  }
  
  next();
};

exports.validateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ 
      error: 'Name, email, and password are required' 
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }
  
  next();
};

exports.validateOrder = (req, res, next) => {
  const { userId, items } = req.body;
  
  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      error: 'User ID and items are required' 
    });
  }
  
  next();
};

exports.validateProfileUpdate = (req, res, next) => {
  const { name, password, email, is_admin, role, id } = req.body;
  
  // SECURITY: Block attempts to update sensitive fields
  if (email !== undefined) {
    return res.status(403).json({ 
      success: false,
      error: 'Email cannot be updated through this endpoint. Use email verification flow.' 
    });
  }
  
  if (is_admin !== undefined || role !== undefined) {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden. Cannot update admin/role fields.' 
    });
  }
  
  if (id !== undefined) {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden. Cannot update user ID.' 
    });
  }
  
  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Name must be a string' 
      });
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({ 
        success: false,
        error: 'Name cannot be empty' 
      });
    }
    if (trimmedName.length > 100) {
      return res.status(400).json({ 
        success: false,
        error: 'Name is too long (max 100 characters)' 
      });
    }
  }
  
  // Validate password if provided
  if (password !== undefined) {
    if (typeof password !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be a string' 
      });
    }
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters long' 
      });
    }
    if (password.length > 128) {
      return res.status(400).json({ 
        success: false,
        error: 'Password is too long (max 128 characters)' 
      });
    }
    // Check for weak passwords
    if (password === '12345678' || password === 'password' || password === 'Password123') {
      return res.status(400).json({ 
        success: false,
        error: 'Password is too weak. Please choose a stronger password.' 
      });
    }
  }
  
  // Ensure at least one valid field is being updated
  if (name === undefined && password === undefined) {
    return res.status(400).json({ 
      success: false,
      error: 'At least one field (name or password) must be provided for update' 
    });
  }
  
  next();
};
