require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  
  // Order pricing (VND - Vietnamese Dong, integer values)
  // All monetary values are in VND (no cents/decimal currency)
  taxRate: parseFloat(process.env.TAX_RATE || '0.1'), // 10% tax
  shippingPrice: parseInt(process.env.SHIPPING_PRICE || '20000', 10), // 20,000 VND flat rate
  freeShippingThreshold: parseInt(process.env.FREE_SHIPPING_THRESHOLD || '200000', 10), // Free shipping over 200,000 VND
  enableFreeShipping: process.env.ENABLE_FREE_SHIPPING === 'true', // Set to 'true' to enable free shipping over threshold
};
