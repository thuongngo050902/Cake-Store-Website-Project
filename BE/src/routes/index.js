const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const reviewRoutes = require('./review.routes');
const orderRoutes = require('./order.routes');
const cartRoutes = require('./cart.routes');

// Use routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);

// Root API route
router.get('/', (req, res) => {
  res.json({
    message: 'Cake Store API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      reviews: '/api/reviews',
      orders: '/api/orders',
      cart: '/api/cart'
    }
  });
});

module.exports = router;
