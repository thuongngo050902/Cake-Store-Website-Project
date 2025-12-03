// Authentication middleware

const config = require('../config');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // TODO: Verify JWT token
    // const decoded = jwt.verify(token, config.jwtSecret);
    // req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // TODO: Check if user has required role
    // if (!roles.includes(req.user.role)) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }
    next();
  };
};
