# Database Tables Summary
## Kids Fashion E-Commerce - Quick Reference

---

## Table Count: 17 Tables

| # | Table Name | Purpose | Records Estimate |
|---|------------|---------|------------------|
| 1 | `roles` | User role definitions | ~3 (GUEST, CUSTOMER, ADMIN) |
| 2 | `users` | User accounts | Variable |
| 3 | `user_roles` | User-Role assignments (M:N) | Variable |
| 4 | `addresses` | Shipping addresses | Variable |
| 5 | `password_reset_tokens` | Password recovery | Variable |
| 6 | `brands` | Product brands | ~10-50 |
| 7 | `categories` | Product categories (hierarchical) | ~20-50 |
| 8 | `sizes` | Size options | ~20 (pre-seeded) |
| 9 | `colors` | Color options | ~15 (pre-seeded) |
| 10 | `products` | Main product catalog | ~100-1000+ |
| 11 | `product_categories` | Product-Category (M:N) | Variable |
| 12 | `product_images` | Product photos | ~3-5 per product |
| 13 | `product_variants` | Size/Color combinations | ~5-20 per product |
| 14 | `inventory` | Stock levels per variant | 1:1 with variants |
| 15 | `carts` | Shopping carts | Variable |
| 16 | `cart_items` | Cart contents | Variable |
| 17 | `orders` | Customer orders | Variable |
| 18 | `order_items` | Order line items | Variable |
| 19 | `payments` | Payment transactions | 1:1 with orders |

---

## Relationship Summary

### One-to-One (1:1)
- `users` ↔ `carts` (one active cart per user)
- `orders` ↔ `payments` (one payment per order)
- `product_variants` ↔ `inventory` (one inventory record per variant)

### One-to-Many (1:N)
- `users` → `addresses` (multiple shipping addresses)
- `users` → `orders` (order history)
- `brands` → `products` (brand's product catalog)
- `products` → `product_images` (multiple images)
- `products` → `product_variants` (size/color combinations)
- `categories` → `categories` (self-referencing hierarchy)
- `carts` → `cart_items` (cart contents)
- `orders` → `order_items` (order line items)

### Many-to-Many (N:N)
- `users` ↔ `roles` (via `user_roles`)
- `products` ↔ `categories` (via `product_categories`)
- `product_variants` ↔ `sizes` (via variant reference)
- `product_variants` ↔ `colors` (via variant reference)

---

## Index Summary

### User Tables
| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| users | idx_users_email | email | Login lookup |
| users | idx_users_status | status | Admin filtering |
| users | idx_users_phone | phone_number | Search |
| addresses | idx_addresses_user | user_id | User's addresses |
| addresses | idx_addresses_default | (user_id, is_default) | Default address |

### Product Tables
| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| products | idx_products_sku | sku | SKU lookup |
| products | idx_products_slug | slug | URL routing |
| products | idx_products_brand | brand_id | Brand filtering |
| products | idx_products_status | status | Active products |
| products | idx_products_price | base_price | Price filtering |
| products | idx_products_gender | gender | Gender filtering |
| products | idx_products_age | (age_min, age_max) | Age filtering |
| products | idx_products_name_search | name (GIN) | Full-text search |
| product_variants | idx_variants_composite | (product_id, size_id, color_id) | Variant lookup |

### Order Tables
| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| orders | idx_orders_code | order_code | Order lookup |
| orders | idx_orders_user | user_id | User's orders |
| orders | idx_orders_status | status | Status filtering |
| orders | idx_orders_created | created_at | Date filtering |
| payments | idx_payments_transaction | transaction_id | Transaction lookup |

---

## Status Enums

### User Status
```
ACTIVE   - Normal active account
LOCKED   - Account suspended by admin
PENDING  - Awaiting email verification
```

### Product Status
```
ACTIVE   - Published and visible
INACTIVE - Hidden from storefront
DRAFT    - Work in progress
```

### Order Status
```
PENDING    - Order placed, awaiting payment
PAID       - Payment received
PROCESSING - Being prepared
SHIPPING   - In transit
COMPLETED  - Delivered successfully
CANCELLED  - Order cancelled
```

### Payment Status
```
PENDING    - Awaiting payment
PROCESSING - Payment in progress
SUCCESS    - Payment successful
FAILED     - Payment failed
REFUNDED   - Payment refunded
CANCELLED  - Payment cancelled
```

### Cart Status
```
ACTIVE    - Current active cart
MERGED    - Guest cart merged to user cart
ABANDONED - Cart expired/abandoned
```

---

## Key Business Logic Notes

### 1. Product Pricing
```
Final Price = base_price + price_adjustment (from variant)

If sale_price is set:
Final Price = sale_price + price_adjustment
```

### 2. Order Totals
```
subtotal     = SUM(order_items.subtotal)
total_amount = subtotal + shipping_fee
```

### 3. Inventory Management
```
available_stock = quantity - reserved_quantity

When adding to cart:
  → Increment reserved_quantity

When order completes:
  → Decrement quantity
  → Decrement reserved_quantity

When order cancels:
  → Decrement reserved_quantity only
```

### 4. Cart Merging (Guest → User)
```
When guest logs in:
1. Find guest cart by session_id
2. Find/create user cart
3. Merge items (sum quantities)
4. Mark guest cart as MERGED
5. Clear session_id from user cart
```

### 5. Order Item Snapshots
Order items store snapshot data at purchase time:
- `product_name` - Product name when ordered
- `variant_sku` - Variant SKU when ordered
- `size_name` - Size name when ordered
- `color_name` - Color name when ordered
- `unit_price` - Price when ordered

This ensures order history remains accurate even if products change.

---

## Files in This Design

| File | Description |
|------|-------------|
| `DATABASE_DESIGN.md` | Complete design documentation |
| `schema.sql` | PostgreSQL DDL script |
| `erd-diagram.mmd` | Mermaid ERD diagram |
| `TABLE_SUMMARY.md` | This quick reference |

---

## Quick Commands

### Create Database (PostgreSQL)
```bash
# Create database
createdb kids_fashion_db

# Run schema
psql -d kids_fashion_db -f schema.sql
```

### Spring Boot application.properties
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/kids_fashion_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

---

*Quick Reference v1.0 - Kids Fashion E-Commerce Database*

