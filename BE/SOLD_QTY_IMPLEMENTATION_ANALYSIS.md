# Sold Quantity Implementation - Analysis & Solution

## Problem Analysis

The proposed `getAllProducts` implementation with `sold_qty` has **critical performance and correctness issues**:

### 🔴 Critical Issues

#### 1. **N+1 Query Problem**
```js
.select('*, categories(id, name, description), order_items(order_id, qty, orders(is_paid))')
```

- This fetches **ALL order_items for ALL products** in a single query
- For 100 products with 10,000 total orders: loads ~10,000 order_items into memory
- **Performance**: Exponential slowdown as order volume grows
- **Memory**: Can crash Node.js with large datasets

#### 2. **Incorrect Nested Relation Syntax**
```js
order_items(order_id, qty, orders(is_paid))
```

- Supabase doesn't support nested relations this way
- `order_items` references `orders` via FK, but this syntax won't work
- Will likely return `null` or error

#### 3. **No Pagination**
- Fetches **all products** at once
- No `limit` or `offset` support
- Cannot scale beyond a few hundred products

#### 4. **Application-Level Aggregation**
```js
const sold_qty = p.order_items?.reduce((acc, item) => {
  return item.orders?.is_paid ? acc + item.qty : acc;
}, 0) || 0;
```

- Calculating `sold_qty` in JavaScript after fetching data
- Should be done in SQL for efficiency
- Wastes CPU and memory

#### 5. **Overrides Existing Function**
- `getAllProducts` already exists with `is_active=true` filter
- Replacing it breaks existing customer endpoints
- Admin endpoints need separate function

---

## ✅ Recommended Solution

### **Option 1: PostgreSQL Function (Best Performance)**

Create a database function to calculate `sold_qty` efficiently:

```sql
-- Create PostgreSQL function in Supabase SQL Editor
CREATE OR REPLACE FUNCTION get_products_with_sold_qty(
  p_category_id INT DEFAULT NULL,
  p_brand TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_min_price INT DEFAULT NULL,
  p_max_price INT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT TRUE,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id INT,
  name TEXT,
  image TEXT,
  brand TEXT,
  price INT,
  category_id INT,
  count_in_stock INT,
  description TEXT,
  rating NUMERIC,
  num_reviews INT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  sold_qty BIGINT,
  category_name TEXT,
  category_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.image,
    p.brand,
    p.price,
    p.category_id,
    p.count_in_stock,
    p.description,
    p.rating,
    p.num_reviews,
    p.is_active,
    p.created_at,
    p.updated_at,
    COALESCE(SUM(
      CASE 
        WHEN o.is_paid = true THEN oi.qty 
        ELSE 0 
      END
    ), 0)::BIGINT as sold_qty,
    c.name as category_name,
    c.description as category_description
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN order_items oi ON p.id = oi.product_id
  LEFT JOIN orders o ON oi.order_id = o.id
  WHERE 
    (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_brand IS NULL OR p.brand = p_brand)
    AND (p_search IS NULL OR p.name ILIKE '%' || p_search || '%' OR p.description ILIKE '%' || p_search || '%')
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_is_active IS NULL OR p.is_active = p_is_active)
  GROUP BY p.id, c.id
  ORDER BY 
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN p.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN p.name END DESC,
    CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN p.price END ASC,
    CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN p.price END DESC,
    CASE WHEN p_sort_by = 'rating' AND p_sort_order = 'asc' THEN p.rating END ASC,
    CASE WHEN p_sort_by = 'rating' AND p_sort_order = 'desc' THEN p.rating END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN p.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN p.created_at END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

**Node.js Service Implementation:**

```js
// Get all products with sold_qty (uses PostgreSQL function)
exports.getAllProductsWithSoldQty = async (filters = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_products_with_sold_qty', {
      p_category_id: filters.category_id || null,
      p_brand: filters.brand || null,
      p_search: filters.search || null,
      p_min_price: filters.min_price || null,
      p_max_price: filters.max_price || null,
      p_is_active: filters.is_active !== undefined ? filters.is_active : true,
      p_sort_by: filters.sort_by || 'created_at',
      p_sort_order: filters.sort_order || 'desc',
      p_limit: filters.limit || 50,
      p_offset: filters.offset || 0
    });

    if (error) throw error;
    
    // Transform flat result to nested structure for consistency
    return data.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image,
      brand: product.brand,
      price: product.price,
      category_id: product.category_id,
      count_in_stock: product.count_in_stock,
      description: product.description,
      rating: product.rating,
      num_reviews: product.num_reviews,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
      sold_qty: product.sold_qty,
      categories: product.category_name ? {
        id: product.category_id,
        name: product.category_name,
        description: product.category_description
      } : null
    }));
  } catch (error) {
    throw new Error(`Error fetching products with sold_qty: ${error.message}`);
  }
};

// Admin version (includes inactive products)
exports.getAllProductsWithSoldQtyAdmin = async (filters = {}) => {
  return exports.getAllProductsWithSoldQty({
    ...filters,
    is_active: undefined // Don't filter by is_active
  });
};
```

---

### **Option 2: Separate Query Approach (Simpler)**

If you can't use PostgreSQL functions, fetch sold_qty separately:

```js
// Get sold_qty for specific products
exports.getSoldQtyForProducts = async (productIds) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, qty, orders!inner(is_paid)')
      .in('product_id', productIds)
      .eq('orders.is_paid', true);

    if (error) throw error;

    // Aggregate by product_id
    const soldQtyMap = {};
    data.forEach(item => {
      soldQtyMap[item.product_id] = (soldQtyMap[item.product_id] || 0) + item.qty;
    });

    return soldQtyMap;
  } catch (error) {
    throw new Error(`Error fetching sold quantities: ${error.message}`);
  }
};

// Get all products with sold_qty (two-query approach)
exports.getAllProductsWithSoldQty = async (filters = {}) => {
  try {
    // First, get products with pagination
    let query = supabase
      .from('products')
      .select('*, categories(id, name, description)')
      .eq('is_active', true);

    // Apply filters
    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    if (filters.brand) query = query.eq('brand', filters.brand);
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.min_price) query = query.gte('price', filters.min_price);
    if (filters.max_price) query = query.lte('price', filters.max_price);

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: products, error: productsError } = await query;
    if (productsError) throw productsError;

    if (!products || products.length === 0) return [];

    // Second, get sold_qty for these products
    const productIds = products.map(p => p.id);
    const soldQtyMap = await exports.getSoldQtyForProducts(productIds);

    // Combine results
    return products.map(product => ({
      ...product,
      sold_qty: soldQtyMap[product.id] || 0
    }));
  } catch (error) {
    throw new Error(`Error fetching products with sold_qty: ${error.message}`);
  }
};
```

---

## Performance Comparison

| Approach | Query Count | Memory Usage | Performance | Scalability |
|----------|-------------|--------------|-------------|-------------|
| **Proposed (nested select)** | 1 | ❌ High (loads all orders) | ❌ Slow | ❌ Poor |
| **Option 1 (PG Function)** | 1 | ✅ Low (aggregated in DB) | ✅ Fast | ✅ Excellent |
| **Option 2 (Two queries)** | 2 | ✅ Low (only paginated data) | ✅ Good | ✅ Good |

---

## Recommendation

**Use Option 1 (PostgreSQL Function)** for best performance:
- ✅ Single optimized query
- ✅ Database-level aggregation
- ✅ Handles millions of orders efficiently
- ✅ Supports pagination, filtering, sorting
- ✅ Works for both customer and admin endpoints

**Use Option 2** if you:
- Cannot create database functions
- Want simpler code maintenance
- Have moderate data volumes (< 100K orders)

---

## Implementation Steps

1. **Run SQL in Supabase Dashboard** → SQL Editor → Execute function creation
2. **Add new service functions** → `product.service.js`
3. **Update controller** → Call new functions from routes
4. **Test with pagination** → `/api/products?limit=20&offset=0`
5. **Monitor performance** → Check query execution time

---

**Generated on:** December 22, 2025  
**Project:** Cake Store Backend  
**Issue:** Sold Quantity Performance Optimization
