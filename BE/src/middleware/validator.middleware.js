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
