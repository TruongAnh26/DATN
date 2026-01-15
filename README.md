# 🛍️ Kids Fashion E-Commerce

> Graduation Project: E-commerce website for kids' fashion with integrated online payment

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Redux Toolkit, TailwindCSS, Vite |
| **Backend** | Spring Boot 3.2, Spring Security, JWT |
| **Database** | PostgreSQL 15+ |
| **API Docs** | Swagger/OpenAPI |

## 🎨 UI Design

Giao diện được lấy cảm hứng từ [Canifa](https://canifa.com/) - thương hiệu thời trang Việt Nam với thiết kế hiện đại, clean và thân thiện.

## 📁 Project Structure

```
DATN/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/kidsfashion/
│   │   ├── config/            # Security, CORS config
│   │   ├── controller/        # REST controllers
│   │   ├── dto/               # Request/Response DTOs
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Data repositories
│   │   ├── security/          # JWT, auth filters
│   │   └── service/           # Business logic
│   └── src/main/resources/
│       └── application.yml    # App configuration
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store & slices
│   │   └── index.css          # Global styles
│   └── package.json
│
├── DATABASE_DESIGN.md          # Complete DB documentation
├── TABLE_SUMMARY.md            # Quick reference
├── schema.sql                  # PostgreSQL DDL
└── erd-diagram.mmd            # Mermaid ERD
```

## 🚀 Quick Start

### Prerequisites

- **Java 17+** (for Spring Boot)
- **Node.js 18+** (for React)
- **PostgreSQL 15+**
- **Maven 3.8+**

### 1. Database Setup

```bash
# Create database
createdb kids_fashion_db
```

**Note:** The schema will be automatically created when you start the Spring Boot application. The `schema.sql` script in `backend/src/main/resources/` will run automatically on startup.

Alternatively, you can manually run the schema script:
```bash
psql -d kids_fashion_db -f schema.sql
```

Or using pgAdmin/DBeaver to execute `schema.sql`.

### 2. Backend Setup

```bash
cd backend

# Configure database connection in src/main/resources/application.yml
# Update username and password if needed

# Run with Maven (schema.sql will run automatically)
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/kids-fashion-api-1.0.0.jar
```

Backend runs at: `http://localhost:8080/api`

Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kidsfashion.com | admin123 |

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/slug/{slug}` - Get product by slug
- `GET /api/products/featured` - Featured products
- `GET /api/products/new-arrivals` - New arrivals
- `GET /api/products/on-sale` - Sale products

### Categories
- `GET /api/categories` - Category tree
- `GET /api/categories/{slug}` - Get category

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/{variantId}` - Update quantity
- `DELETE /api/cart/items/{variantId}` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/{code}` - Get order by code

## 🎯 Features

### Customer Features
- ✅ Browse products by category, brand, size, color, age
- ✅ Search products with filters
- ✅ View product details with variants (size/color)
- ✅ Add to cart (guest & registered users)
- ✅ User registration & login
- ✅ Order placement
- ✅ Order history

### Admin Features (TODO)
- Product management (CRUD)
- Category & brand management
- Order management
- User management

### Payment Integration (TODO)
- VNPay integration
- MoMo integration
- COD support

## 🎨 UI Features

Inspired by [Canifa](https://canifa.com/):

- **Clean, modern design** with warm color palette
- **Responsive layout** for all devices
- **Product cards** with hover effects & quick actions
- **Category navigation** with dropdown menus
- **Hero slider** with Swiper.js
- **Smooth animations** using Tailwind CSS

## 📊 Database

See detailed documentation:
- `DATABASE_DESIGN.md` - Complete schema design
- `TABLE_SUMMARY.md` - Quick reference
- `erd-diagram.mmd` - Visual ERD (use mermaid.live)

### Main Tables
1. **Users** - users, roles, user_roles, addresses
2. **Products** - products, categories, brands, variants, inventory
3. **Cart** - carts, cart_items
4. **Orders** - orders, order_items, payments

## 🔧 Configuration

### Backend (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/kids_fashion_db
    username: postgres
    password: postgres

jwt:
  secret: your-secret-key
  expiration: 86400000

cors:
  allowed-origins: http://localhost:3000
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8080/api
```

## 📝 License

This project is part of a graduation thesis at [Your University].

---

Made with ❤️ for Kids Fashion

