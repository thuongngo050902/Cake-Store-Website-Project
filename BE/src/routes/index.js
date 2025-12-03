const express = require('express');
const router = express.Router();

// Import route modules
const cakeRoutes = require('./cake.routes');
const userRoutes = require('./user.routes');
const orderRoutes = require('./order.routes');

// Use routes
router.use('/cakes', cakeRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);

// Root API route
router.get('/', (req, res) => {
  res.json({
    message: 'Cake Store API',
    version: '1.0.0',
    endpoints: {
      cakes: '/api/cakes',
      users: '/api/users',
      orders: '/api/orders'
    }
  });
});

module.exports = router;
