import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CategoryPage from './pages/CategoryPage'
import AccountPage from './pages/AccountPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage'
import ProductListPage from './pages/admin/ProductListPage'
import ProductFormPage from './pages/admin/ProductFormPage'
import OrderListPage from './pages/admin/OrderListPage'
import CategoryListPage from './pages/admin/CategoryListPage'
import BrandListPage from './pages/admin/BrandListPage'
import UserListPage from './pages/admin/UserListPage'

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth)
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  // Check if user has admin role
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN')
  
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/track/:orderCode" element={<OrderDetailPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
      </Route>

      {/* Auth pages without layout */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="categories" element={<CategoryListPage />} />
        <Route path="brands" element={<BrandListPage />} />
        <Route path="users" element={<UserListPage />} />
      </Route>
    </Routes>
  )
}

export default App
