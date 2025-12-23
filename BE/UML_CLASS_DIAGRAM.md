# Cake Store - UML Class Diagram

## Domain Model Overview

This diagram represents the database schema and relationships between domain entities in the Cake Store backend system.

```mermaid
classDiagram
    class User {
        +Integer id [PK]
        +String name
        +String email [UNIQUE]
        +String password [HASHED]
        +Boolean is_admin [DEFAULT: false]
        +Timestamp created_at
        +Timestamp updated_at
        +toJSON() Object
    }

    class Category {
        +Integer id [PK]
        +String name
        +String description
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Product {
        +Integer id [PK]
        +String name
        +String image
        +String brand
        +Integer price [VND]
        +Integer category_id [FK]
        +Integer count_in_stock [DEFAULT: 0]
        +String description
        +Decimal rating [DEFAULT: 0]
        +Integer num_reviews [DEFAULT: 0]
        +Boolean is_active [DEFAULT: true]
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Review {
        +Integer id [PK]
        +Integer product_id [FK]
        +Integer user_id [FK]
        +String name
        +Integer rating [1-5]
        +String comment
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Order {
        +Integer id [PK]
        +Integer user_id [FK]
        +String payment_method [DEFAULT: 'PayPal']
        +Integer items_price [VND]
        +Integer tax_price [VND]
        +Integer shipping_price [VND]
        +Integer total_price [VND]
        +Boolean is_paid [DEFAULT: false]
        +Timestamp paid_at
        +Boolean is_delivered [DEFAULT: false]
        +Timestamp delivered_at
        +String shipping_address
        +String shipping_city
        +String shipping_postal_code
        +String shipping_country
        +Timestamp created_at
        +Timestamp updated_at
    }

    class OrderItem {
        +Integer id [PK]
        +Integer order_id [FK, CASCADE]
        +Integer product_id [FK]
        +String name [SNAPSHOT]
        +Integer qty
        +String image [SNAPSHOT]
        +Integer price [VND, SNAPSHOT]
    }

    %% Relationships
    User "1" --> "0..*" Order : places
    User "1" --> "0..*" Review : writes
    Category "1" --> "0..*" Product : contains
    Product "1" --> "0..*" Review : has
    Product "1" --> "0..*" OrderItem : referenced in
    Order "1" --> "1..*" OrderItem : contains

    note for User "Authentication & Authorization\nis_admin determines admin privileges\npassword is bcrypt hashed"
    note for Order "Payment & Delivery Tracking\nAll prices in VND (integer)\nSupports PayPal payment"
    note for Review "Purchase Verification Required\nUser must have purchased product\nOnly paid orders count"
    note for Product "Inventory & Soft Delete\ncount_in_stock tracked per order\nis_active=false for soft delete\nHidden from customers when inactive"
    note for OrderItem "Order Snapshot Pattern\nStores product name, price, image\nat time of purchase\nCascade delete with order"
```

## Entity Relationships

### 1. **User → Order** (One-to-Many)

- A user can place multiple orders
- Each order belongs to one user
- Business Rule: User must be authenticated to create orders

### 2. **User → Review** (One-to-Many)

- A user can write multiple reviews (for different products)
- Each review belongs to one user
- Business Rule: User can only review products they've purchased (via paid orders)
- Constraint: One review per user per product

### 3. **Category → Product** (One-to-Many)

- A category can contain multiple products
- Each product belongs to one category (optional, FK nullable)

### 4. **Product → Review** (One-to-Many)

- A product can have multiple reviews
- Each review is for one product
- Product's `rating` and `num_reviews` are automatically calculated from reviews

### 5. **Product → OrderItem** (One-to-Many)

- A product can appear in multiple order items
- Each order item references one product
- Order item stores a snapshot of product data at purchase time
- Business Rule: Products with order history use soft delete (is_active=false)

### 6. **Order → OrderItem** (One-to-Many, Composition)

- An order must contain at least one order item
- Each order item belongs to exactly one order
- Cascade delete: Deleting an order deletes its order items

## Key Business Rules

### Authorization & Authentication

- **is_admin** (User): Determines admin privileges for:
  - Managing products (create, update, delete)
  - Managing all orders (view, update, mark paid/delivered)
  - Viewing inactive products
  - Deleting any review

### Products & Inventory

- **count_in_stock**: Automatically decremented when orders are placed
- **rating**: Calculated average from all reviews (decimal 0.0-5.0)
- **num_reviews**: Count of reviews for the product
- **price**: Stored as integer VND (Vietnamese Dong)
- **is_active**: Soft delete flag (default: true)
  - Set to `false` when admin deletes a product that has order history
  - Products with `is_active=false` are hidden from customer APIs
  - Admin can still view inactive products via admin endpoints
  - Hard delete only if product has NEVER been ordered

### Orders & Payment

- **is_paid** (Order): Tracks payment status
  - Only paid orders count for review purchase verification
  - Set to true when payment is confirmed (with paid_at timestamp)
- **is_delivered** (Order): Tracks delivery status
  - Set to true when order is delivered (with delivered_at timestamp)
- All prices stored as **integer VND** (Vietnamese Dong)
- Server-side price calculation (client prices ignored for security)
- Tax rate and shipping costs configured server-side
- Free shipping threshold available (configurable)

### Reviews & Ratings

- **rating** (Review): Integer 1-5 (validated)
- Users can only review products they've purchased (verified via paid orders)
- Unique constraint on (user_id, product_id) - one review per user per product
- Only review owner can update their review (NOT admin)
- Review owner OR admin can delete reviews
- Product rating auto-updates when reviews change

### Data Integrity

- **OrderItem Snapshot Pattern**: Stores product name, price, and image at time of purchase
  - Preserves order history even if product is later modified or soft-deleted
  - Ensures historical order accuracy
- **Cascade Delete**: order_items cascade delete with orders
- **Soft Delete**: Products with order history cannot be hard deleted
- **FK Constraints**: Enforced at database level

## Data Types Legend

| Type         | Description                                          | Example              |
| ------------ | ---------------------------------------------------- | -------------------- |
| Integer      | Whole number, used for IDs, quantities, prices (VND) | 100000 (100k VND)    |
| String       | Text data, varchar in DB                             | "Chocolate Cake"     |
| Boolean      | True/False flag                                      | true, false          |
| Decimal(3,1) | Decimal with 1 decimal place, range 0.0-5.0          | 4.5                  |
| Timestamp    | Date and time                                        | 2025-12-20T10:30:00Z |

## Notes

- **[PK]**: Primary Key
- **[FK]**: Foreign Key
- **[UNIQUE]**: Unique constraint
- **[VND]**: Vietnamese Dong currency (integer storage)
- **[HASHED]**: Password stored using bcrypt hashing
- **[SNAPSHOT]**: Data copied at time of order creation
- **[CASCADE]**: Delete cascades to related records
- **[DEFAULT: value]**: Default value when creating new record
- All entities have `created_at` and `updated_at` timestamps (except OrderItem)
- Timestamps use ISO 8601 format with timezone

---

**Generated on:** December 21, 2025  
**Project:** Cake Store Website - Backend API  
**Version:** 2.0 (includes soft delete support)
**Database:** PostgreSQL (via Supabase)
