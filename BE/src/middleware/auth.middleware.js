// Authentication middleware
const jwt = require('jsonwebtoken');
const config = require('../config');
const supabase = require('../config/supabase');

// Main authentication middleware - protects routes
exports.protect = async (req, res, next) => {
  try {
    // Parse Authorization header robustly
    const authHeader = req.headers.authorization;
    console.log('[TEMP DEBUG] authHeader:', authHeader); // Temporary debug log
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized. No token provided.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token with JWT_SECRET (do not throw on error)
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
      console.log('[TEMP DEBUG] decoded:', decoded); // Temporary debug log
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired' });
      }
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    // Extract user ID from decoded payload (support multiple fields)
    const userId = decoded.id || decoded.sub || decoded.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token payload missing user ID' 
      });
    }
    
    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Attach sanitized user object (remove password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized' 
    });
  }
};

// Authorization middleware - check if user is admin
exports.authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized' 
    });
  }
  
  if (!req.user.is_admin) {
    return res.status(403).json({ 
      success: false, 
      error: 'Forbidden. Admin privileges required.' 
    });
  }
  
  next();
};

// Deprecated alias (for backward compatibility)
exports.authenticate = exports.protect;

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Extract user ID from decoded payload
      const userId = decoded.id || decoded.sub || decoded.userId;
      
      if (userId) {
        // Fetch user from Supabase
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (user && !error) {
          // Attach sanitized user object (remove password)
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user is admin (deprecated - use authorizeAdmin)
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  
  if (!req.user.is_admin) {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  
  next();
};
