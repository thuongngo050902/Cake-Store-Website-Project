# Currency Migration - Unified Diffs

This document contains all code changes made during the USD to VND migration.

---

## 1. src/utils/money.js (NEW FILE)

```javascript
/**
 * Money utility functions for VND (Vietnamese Dong) handling
 *
 * VND Policy:
 * - All monetary values are represented as INTEGER dong (smallest unit)
 * - No fractional currency (no cents/xu equivalent used in practice)
 * - All calculations use integer arithmetic
 * - Database stores integers (or numeric with no decimal places)
 */

/**
 * Convert a value to VND integer
 * @param {number|string} value - The value to convert
 * @returns {number} Integer dong amount
 */
function toVND(value) {
  return Math.round(Number(value));
}

/**
 * Format VND amount for display
 * @param {number} value - Integer dong amount
 * @returns {string} Formatted string like "12.345₫" or "12.345 VND"
 */
function formatVND(value) {
  const intValue = toVND(value);
  // Format with thousand separators (dot for VN locale)
  return intValue.toLocaleString("vi-VN") + "₫";
}

/**
 * Format VND amount for display (alternative with VND label)
 * @param {number} value - Integer dong amount
 * @returns {string} Formatted string like "12.345 VND"
 */
function formatVNDWithLabel(value) {
  const intValue = toVND(value);
  return intValue.toLocaleString("vi-VN") + " VND";
}

module.exports = {
  toVND,
  formatVND,
  formatVNDWithLabel,
};
```

---

## 2. src/services/order.service.js

### Diff 1: Import money utilities

```diff
 const supabase = require('../config/supabase');
 const config = require('../config');
+const { toVND, formatVND } = require('../utils/money');
```

### Diff 2: Rename cents variables to VND

```diff
     console.log('[createOrder Service] Starting order creation for user:', user_id);
     console.log('[createOrder Service] Processing', order_items.length, 'items');

-    // Validate and fetch products, calculate prices server-side
+    // Validate and fetch products, calculate prices server-side (VND integers)
     const validatedItems = [];
-    let itemsPriceCents = 0;
+    let itemsPriceVND = 0;
```

### Diff 3: Convert price calculation to VND integers

```diff
-      // Use server-side price (DO NOT trust client)
-      const unitPriceCents = Math.round(Number(product.price) * 100);
-      const lineTotalCents = unitPriceCents * item.qty;
+      // Use server-side price (DO NOT trust client) - VND integer
+      const unitPriceVND = toVND(product.price);
+      const lineTotalVND = unitPriceVND * item.qty;

       // Log if client submitted price differs from DB price
       if (item.price && Math.abs(Number(item.price) - Number(product.price)) > 0.01) {
         console.warn('[createOrder Service] Price mismatch detected!');
-        console.warn('[createOrder Service] Product:', product.id, 'Client price:', item.price, 'DB price:', product.price);
+        console.warn('[createOrder Service] Product:', product.id, 'Client price:', item.price, 'VND, DB price:', product.price, 'VND');
         console.warn('[createOrder Service] Using DB price for security');
       }

-      itemsPriceCents += lineTotalCents;
+      itemsPriceVND += lineTotalVND;
```

### Diff 4: Update validated items structure

```diff
       validatedItems.push({
         product_id: product.id,
         name: product.name,
         qty: item.qty,
         image: product.image || '',
-        price: product.price, // Use DB price
-        price_cents: unitPriceCents,
-        line_total_cents: lineTotalCents
+        price: product.price, // Use DB price (integer VND)
+        price_vnd: unitPriceVND,
+        line_total_vnd: lineTotalVND
       });

-      console.log('[createOrder Service] Item validated:', product.name, 'qty:', item.qty, 'unit price:', product.price, 'line total:', (lineTotalCents / 100).toFixed(2));
+      console.log('[createOrder Service] Item validated:', product.name, 'qty:', item.qty, 'unit price:', formatVND(product.price), 'line total:', formatVND(lineTotalVND));
```

### Diff 5: Update tax and shipping calculations

```diff
-    // Calculate tax (using integer arithmetic)
-    const taxPriceCents = Math.round(itemsPriceCents * config.taxRate);
+    // Calculate tax (using integer arithmetic on VND)
+    const taxPriceVND = Math.round(itemsPriceVND * config.taxRate);

-    // Calculate shipping
-    const itemsPriceDecimal = itemsPriceCents / 100;
-    let shippingPriceCents;
+    // Calculate shipping (VND integers)
+    let shippingPriceVND;

-    if (config.enableFreeShipping && itemsPriceDecimal >= config.freeShippingThreshold) {
+    if (config.enableFreeShipping && itemsPriceVND >= config.freeShippingThreshold) {
       // Free shipping if enabled and order meets threshold
-      shippingPriceCents = 0;
+      shippingPriceVND = 0;
     } else {
-      // Charge standard shipping price
-      shippingPriceCents = Math.round(config.shippingPrice * 100);
+      // Charge standard shipping price (already in VND)
+      shippingPriceVND = toVND(config.shippingPrice);
     }

-    // Calculate total
-    const totalPriceCents = itemsPriceCents + taxPriceCents + shippingPriceCents;
-
-    // Convert back to decimal for database storage
-    const itemsPrice = (itemsPriceCents / 100).toFixed(2);
-    const taxPrice = (taxPriceCents / 100).toFixed(2);
-    const shippingPrice = (shippingPriceCents / 100).toFixed(2);
-    const totalPrice = (totalPriceCents / 100).toFixed(2);
-
-    console.log('[createOrder Service] Price calculation:');
-    console.log('[createOrder Service]   Items:', itemsPrice);
-    console.log('[createOrder Service]   Tax:', taxPrice, `(${config.taxRate * 100}%)`);
-    console.log('[createOrder Service]   Shipping:', shippingPrice,
-      config.enableFreeShipping && itemsPriceDecimal >= config.freeShippingThreshold
+    // Calculate total (all VND integers)
+    const totalPriceVND = itemsPriceVND + taxPriceVND + shippingPriceVND;
+
+    console.log('[createOrder Service] Price calculation (VND):');
+    console.log('[createOrder Service]   Items:', formatVND(itemsPriceVND));
+    console.log('[createOrder Service]   Tax:', formatVND(taxPriceVND), `(${config.taxRate * 100}%)`);
+    console.log('[createOrder Service]   Shipping:', formatVND(shippingPriceVND),
+      config.enableFreeShipping && itemsPriceVND >= config.freeShippingThreshold
         ? '(FREE - over threshold)'
         : config.enableFreeShipping
-          ? `(under threshold of $${config.freeShippingThreshold})`
+          ? `(under threshold of ${formatVND(config.freeShippingThreshold)})`
           : '');
-    console.log('[createOrder Service]   Total:', totalPrice);
+    console.log('[createOrder Service]   Total:', formatVND(totalPriceVND));
```

### Diff 6: Store VND integers in database

```diff
-    // Create order record
+    // Create order record (store VND integers)
     const orderRecord = {
       user_id,
       payment_method,
-      items_price: parseFloat(itemsPrice),
-      tax_price: parseFloat(taxPrice),
-      shipping_price: parseFloat(shippingPrice),
-      total_price: parseFloat(totalPrice),
+      items_price: itemsPriceVND,
+      tax_price: taxPriceVND,
+      shipping_price: shippingPriceVND,
+      total_price: totalPriceVND,
       shipping_address,
       shipping_city,
       shipping_postal_code,
```

---

## 3. src/config/index.js

```diff
   // JWT
   jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
   jwtExpiration: process.env.JWT_EXPIRATION || '24h',

-  // Order pricing (can be overridden via environment variables)
+  // Order pricing (VND - Vietnamese Dong, integer values)
+  // All monetary values are in VND (no cents/decimal currency)
   taxRate: parseFloat(process.env.TAX_RATE || '0.1'), // 10% tax
-  shippingPrice: parseFloat(process.env.SHIPPING_PRICE || '10.00'), // $10 flat rate
-  freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '100.00'), // Free shipping over $100
+  shippingPrice: parseInt(process.env.SHIPPING_PRICE || '20000', 10), // 20,000 VND flat rate
+  freeShippingThreshold: parseInt(process.env.FREE_SHIPPING_THRESHOLD || '200000', 10), // Free shipping over 200,000 VND
   enableFreeShipping: process.env.ENABLE_FREE_SHIPPING === 'true', // Set to 'true' to enable free shipping over threshold
```

---

## 4. .env.example

```diff
 # JWT Configuration
 JWT_SECRET=your-secret-key-here
 JWT_EXPIRATION=24h

+# Order Pricing Configuration (VND - Vietnamese Dong)
+# All monetary values are integers in VND (no decimal currency)
+TAX_RATE=0.1
+SHIPPING_PRICE=20000
+FREE_SHIPPING_THRESHOLD=200000
+ENABLE_FREE_SHIPPING=true
+
 # Other configurations
 # FRONTEND_URL=http://localhost:5173
```

---

## 5. README

### Diff 1: Update database schema comments

```diff
 -- products
-products(id, name, image, brand, price, category_id, count_in_stock, description, rating, num_reviews, created_at, updated_at)
+products(id, name, image, brand, price, category_id, count_in_stock, description, rating, num_reviews, created_at, updated_at)
+-- Note: price is stored as integer VND (Vietnamese Dong)

 -- reviews
 reviews(id, product_id, name, rating, comment, created_at, updated_at)

 -- orders
 orders(id, user_id, payment_method, items_price, tax_price, shipping_price, total_price, is_paid, paid_at, is_delivered, delivered_at, shipping_address, shipping_city, shipping_postal_code, shipping_country, created_at, updated_at)
+-- Note: All price fields (items_price, tax_price, shipping_price, total_price) are stored as integer VND
```

### Diff 2: Add Currency Policy section

```diff
 ✅ Logger utility
 ✅ Product filtering, searching, and sorting
 ✅ Review system with automatic rating updates
 ✅ Order management with payment and delivery tracking
 ✅ Environment configuration with dotenv

+## Currency Policy:
+
+**Vietnamese Dong (VND) Integer Representation**
+- All monetary values use **integer VND** (no fractional currency)
+- Prices stored and calculated as integers (e.g., 50000 = 50.000₫)
+- No cent-based arithmetic (no multiply/divide by 100)
+- Tax and shipping calculated with integer arithmetic and rounding
+- Display formatting: `50.000₫` or `50.000 VND`
+- Example values:
+  - Product price: `50000` VND (50.000₫)
+  - Shipping: `20000` VND (20.000₫)
+  - Free shipping threshold: `200000` VND (200.000₫)
+
 ## Setup:
```

### Diff 3: Update setup instructions

````diff
 2. Configure environment variables:
    - Copy `.env.example` to `.env`
    - Fill in your Supabase credentials:
      ```
      SUPABASE_URL=your-project-url
      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
      SUPABASE_ANON_KEY=your-anon-key
      JWT_SECRET=your-strong-secret-key
+
+     # Optional: Order pricing (VND - Vietnamese Dong)
+     TAX_RATE=0.1
+     SHIPPING_PRICE=20000
+     FREE_SHIPPING_THRESHOLD=200000
+     ENABLE_FREE_SHIPPING=true
      ```

 3. Create Supabase tables (see Database Schema above)
+   - **Important**: All price fields should store integer VND values
+   - Recommended types: `integer` or `numeric(12,0)` for price columns
````

---

## Summary of Changes

**Files Created:** 1

- `src/utils/money.js` - VND utility functions

**Files Modified:** 4

- `src/services/order.service.js` - Core pricing logic
- `src/config/index.js` - Environment variable handling
- `.env.example` - Environment variable documentation
- `README` - Project documentation

**Files for Review:** 2

- `CURRENCY_MIGRATION.md` - Complete migration guide
- `CURRENCY_MIGRATION_DIFFS.md` - This file (unified diffs)

**Key Changes:**

- Removed all cent-based arithmetic (no `* 100` or `/ 100`)
- Changed all `Cents` variables to `VND`
- Updated default values: $10 → 20,000 VND, $100 → 200,000 VND
- Store integers directly in database (removed `.toFixed(2)`)
- Added VND formatting for logs and display
- Updated all documentation and comments

**No Changes Required:**

- Controllers (pass-through to services)
- Models (schema-agnostic representations)
- Routes (no currency logic)
- Middleware (no price handling)
