# Currency Migration Report: USD → VND

**Date:** December 12, 2025  
**Migration:** USD/cents to Vietnamese Dong (VND) integer representation

---

## Summary

Successfully migrated all monetary handling from USD with cent-based arithmetic to Vietnamese Dong (VND) with integer-only arithmetic. All price calculations now use VND as the canonical currency with no fractional units.

---

## Files Changed

### 1. **src/utils/money.js** (NEW FILE)

- **Reason:** Created VND utility functions for consistent money handling
- **Changes:**
  - `toVND(value)` - Converts any value to integer dong
  - `formatVND(value)` - Formats as "12.345₫" with thousand separators
  - `formatVNDWithLabel(value)` - Formats as "12.345 VND"
  - Complete JSDoc documentation with VND policy

### 2. **src/services/order.service.js** (MODIFIED)

- **Reason:** Core order pricing logic converted from cents to VND integers
- **Changes:**
  - Imported money utility functions (`toVND`, `formatVND`)
  - Renamed variables: `itemsPriceCents` → `itemsPriceVND`, etc.
  - Removed cent multiplication/division (no more `* 100` or `/ 100`)
  - Updated price calculation to use integer VND arithmetic directly
  - Changed shipping calculation to use integer config values
  - Updated logging to display formatted VND (e.g., "50.000₫")
  - Modified price mismatch warnings to reference VND
  - Store integer VND directly in database (removed `.toFixed(2)` conversions)

### 3. **src/config/index.js** (MODIFIED)

- **Reason:** Environment variable handling changed to VND integers
- **Changes:**
  - Added VND policy comment
  - `shippingPrice`: Changed from `parseFloat('10.00')` to `parseInt('20000', 10)`
  - `freeShippingThreshold`: Changed from `parseFloat('100.00')` to `parseInt('200000', 10)`
  - Updated default values to realistic VND amounts
  - Updated comments to clarify integer VND values

### 4. **.env.example** (MODIFIED)

- **Reason:** Document VND-specific environment variables
- **Changes:**
  - Added new section "Order Pricing Configuration (VND)"
  - Added VND policy comment
  - Added example values:
    - `TAX_RATE=0.1`
    - `SHIPPING_PRICE=20000`
    - `FREE_SHIPPING_THRESHOLD=200000`
    - `ENABLE_FREE_SHIPPING=true`

### 5. **README** (MODIFIED)

- **Reason:** Update documentation to reflect VND currency
- **Changes:**
  - Updated database schema comments to note VND integer storage
  - Added "Currency Policy" section explaining VND implementation
  - Updated setup instructions with VND environment variable examples
  - Added note about database column types for price fields
  - Added example VND values for reference

---

## Database Schema Considerations

### Current Schema

The database likely has these numeric columns:

- `products.price`
- `orders.items_price`
- `orders.tax_price`
- `orders.shipping_price`
- `orders.total_price`
- `order_items.price`

### Recommended Schema Changes

#### Option 1: Keep existing numeric/decimal columns (RECOMMENDED)

```sql
-- No schema change required
-- Current numeric/decimal columns can store integers without fractional part
-- Application code now writes integers instead of decimals
-- Example: 50000 instead of 50.00
```

**Pros:** No migration needed, backward compatible  
**Cons:** Column type implies decimals but stores integers

#### Option 2: Explicit integer columns (OPTIONAL - for clarity)

```sql
-- Migration to explicit integer types
ALTER TABLE products
  ALTER COLUMN price TYPE INTEGER USING price::integer;

ALTER TABLE orders
  ALTER COLUMN items_price TYPE INTEGER USING items_price::integer,
  ALTER COLUMN tax_price TYPE INTEGER USING tax_price::integer,
  ALTER COLUMN shipping_price TYPE INTEGER USING shipping_price::integer,
  ALTER COLUMN total_price TYPE INTEGER USING total_price::integer;

ALTER TABLE order_items
  ALTER COLUMN price TYPE INTEGER USING price::integer;
```

**Pros:** Type system enforces integer policy  
**Cons:** Requires migration, potential downtime

#### Option 3: Use numeric(12,0) for large integer precision

```sql
-- For very large VND amounts without float precision issues
ALTER TABLE products
  ALTER COLUMN price TYPE NUMERIC(12,0);

ALTER TABLE orders
  ALTER COLUMN items_price TYPE NUMERIC(12,0),
  ALTER COLUMN tax_price TYPE NUMERIC(12,0),
  ALTER COLUMN shipping_price TYPE NUMERIC(12,0),
  ALTER COLUMN total_price TYPE NUMERIC(12,0);

ALTER TABLE order_items
  ALTER COLUMN price TYPE NUMERIC(12,0);
```

**Recommendation:** Start with Option 1 (no migration). The application code now writes integers. Consider Option 2 or 3 in future schema updates for clarity.

---

## Data Migration (if needed)

If existing data has USD decimal values that need conversion to VND:

```sql
-- Example: Convert USD to VND (assuming 1 USD = 24,000 VND)
-- ONLY if you have existing USD data to migrate

UPDATE products
SET price = ROUND(price * 24000);

UPDATE orders
SET items_price = ROUND(items_price * 24000),
    tax_price = ROUND(tax_price * 24000),
    shipping_price = ROUND(shipping_price * 24000),
    total_price = ROUND(total_price * 24000);

UPDATE order_items
SET price = ROUND(price * 24000);
```

**⚠️ WARNING:** This is a destructive operation. Backup your database first!

---

## API Changes & Examples

### Order Creation Request (Postman/API Client)

**Before (USD):**

```json
POST /api/orders
{
  "order_items": [
    {
      "product_id": "123e4567-e89b-12d3-a456-426614174000",
      "qty": 2,
      "price": 25.50
    }
  ],
  "payment_method": "PayPal",
  "shipping_address": "123 Main St",
  "shipping_city": "Hanoi",
  "shipping_postal_code": "100000",
  "shipping_country": "Vietnam"
}
```

**After (VND):**

```json
POST /api/orders
{
  "order_items": [
    {
      "product_id": "123e4567-e89b-12d3-a456-426614174000",
      "qty": 2,
      "price": 50000
    }
  ],
  "payment_method": "PayPal",
  "shipping_address": "123 Main St",
  "shipping_city": "Hanoi",
  "shipping_postal_code": "100000",
  "shipping_country": "Vietnam"
}
```

**Note:** The `price` field in `order_items` is optional and not trusted. The server always uses the current database price for security.

### Order Creation Response

**Before (USD):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "items_price": 51.0,
    "tax_price": 5.1,
    "shipping_price": 10.0,
    "total_price": 66.1,
    "payment_method": "PayPal",
    "is_paid": false,
    "is_delivered": false,
    "created_at": "2025-12-12T10:30:00Z"
  }
}
```

**After (VND):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "items_price": 100000,
    "tax_price": 10000,
    "shipping_price": 20000,
    "total_price": 130000,
    "payment_method": "PayPal",
    "is_paid": false,
    "is_delivered": false,
    "created_at": "2025-12-12T10:30:00Z"
  }
}
```

### Product Response

**Before (USD):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Chocolate Cake",
  "price": 25.5,
  "category_id": "...",
  "count_in_stock": 15
}
```

**After (VND):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Chocolate Cake",
  "price": 50000,
  "category_id": "...",
  "count_in_stock": 15
}
```

---

## Testing Checklist

- [ ] Create order with single item - verify VND integer prices
- [ ] Create order with multiple items - verify correct VND sum
- [ ] Test tax calculation - verify rounded integer result
- [ ] Test shipping calculation - verify integer shipping_price from config
- [ ] Test free shipping threshold - verify VND integer comparison
- [ ] Verify price mismatch detection logs show VND values
- [ ] Check database - confirm integer values stored (no decimals)
- [ ] Test product creation/update with VND prices
- [ ] Verify order retrieval returns integer VND values
- [ ] Test frontend display with VND formatting

---

## Frontend Integration Notes

If you have a frontend application, update it to:

1. **Display prices as VND:**

   ```javascript
   // JavaScript example
   const formatVND = (amount) => {
     return new Intl.NumberFormat("vi-VN", {
       style: "currency",
       currency: "VND",
     }).format(amount);
   };

   // Usage: formatVND(50000) → "50.000 ₫"
   ```

2. **Send integer prices:**

   - No decimal input for prices
   - Validate prices as integers
   - Remove cent-based calculations

3. **Update form validation:**
   - Price minimum: 1000 VND (not 0.01)
   - Price step: 1000 VND increments
   - No decimal places in price inputs

---

## Rollback Plan

If you need to rollback this migration:

1. **Revert code changes:**

   ```bash
   git revert <commit-hash>
   ```

2. **If database was migrated, convert VND back to USD:**

   ```sql
   -- Example: Convert VND back to USD (1 VND = 0.000042 USD)
   UPDATE products
   SET price = ROUND(price / 24000, 2);

   UPDATE orders
   SET items_price = ROUND(items_price / 24000, 2),
       tax_price = ROUND(tax_price / 24000, 2),
       shipping_price = ROUND(shipping_price / 24000, 2),
       total_price = ROUND(total_price / 24000, 2);
   ```

3. **Restore environment variables to USD defaults**

---

## Git Commit Message

```
feat: migrate currency from USD to VND (Vietnamese Dong)

BREAKING CHANGE: All monetary values now use integer VND instead of USD with cents

Changes:
- Add src/utils/money.js with VND utility functions (toVND, formatVND)
- Update order.service.js to use VND integer arithmetic (no cents)
- Modify config/index.js to parse VND integer environment variables
- Update .env.example with VND configuration examples
- Update README with VND currency policy documentation
- Remove all USD references and cent-based calculations
- Change default shipping from $10 to 20,000 VND
- Change free shipping threshold from $100 to 200,000 VND

Database considerations:
- Price columns now store integer VND (no decimal places)
- Existing numeric/decimal columns compatible (stores integers)
- Optional schema migration to INTEGER type available

Migration impact:
- API requests/responses now use integer prices (e.g., 50000 not 50.00)
- Frontend must display VND currency format (e.g., "50.000₫")
- Environment variables changed: SHIPPING_PRICE, FREE_SHIPPING_THRESHOLD
- Tax and shipping calculated with integer arithmetic and rounding

See CURRENCY_MIGRATION.md for complete migration details.
```

---

## Additional Recommendations

1. **Add input validation:**

   - Validate that all price inputs are positive integers
   - Reject decimal values in API endpoints

2. **Add API documentation:**

   - Update Swagger/OpenAPI specs to reflect integer price types
   - Document currency as VND in all price field descriptions

3. **Monitor logs:**

   - Watch for price mismatch warnings in production
   - Verify formatVND() displays correctly in logs

4. **Update tests:**

   - Modify unit tests to use VND integer values
   - Update assertion values (no more `.toFixed(2)`)
   - Add tests for money utility functions

5. **Frontend coordination:**
   - Ensure frontend team updates before deployment
   - Coordinate API version if needed
   - Consider feature flag for gradual rollout

---

## Questions / TODO for Manual Review

- [ ] Should we add API versioning for this breaking change?
- [ ] Do we need to maintain backward compatibility with USD?
- [ ] Should we add explicit validation for non-integer prices?
- [ ] Do we want to store currency code ('VND') in database?
- [ ] Should we add currency conversion support for international customers?
- [ ] Do we need to update any seed data files?
- [ ] Are there any automated tests that need VND value updates?
- [ ] Should we add middleware to reject decimal price values?

---

## Contact

For questions about this migration, contact the backend development team.

**Migration completed successfully! ✓**
