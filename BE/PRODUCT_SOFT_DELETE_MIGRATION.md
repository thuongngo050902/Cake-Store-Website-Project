# Product Soft Delete Migration

## Database Schema Change Required

### Add `is_active` column to `products` table

```sql
-- Add is_active column to products table
ALTER TABLE products
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Create index for better query performance
CREATE INDEX idx_products_is_active ON products(is_active);

-- Optionally, create a compound index for common queries
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
```

## Migration Instructions

### For Supabase Users:

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL commands above
4. Verify the column was added: `SELECT * FROM products LIMIT 1;`

### Verification

After running the migration, ensure:

- All existing products have `is_active = true`
- The column is NOT NULL with DEFAULT true
- Indexes are created for performance

## Rollback (if needed)

```sql
-- Drop indexes
DROP INDEX IF EXISTS idx_products_category_active;
DROP INDEX IF EXISTS idx_products_is_active;

-- Remove column
ALTER TABLE products DROP COLUMN is_active;
```

## Notes

- This is a non-breaking change - existing products will automatically have `is_active = true`
- All existing orders and order_items remain unchanged
- No data loss occurs during this migration
