import React, { useContext } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import TopBar from './components/TopBar'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import ProductDetail from './pages/ProductDetail'
import Search from './pages/Search'
import CategoryBrowse from './pages/CategoryBrowse'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import VNPaySimulator from './pages/VNPaySimulator'
import Orders from './pages/Orders'
import AdminOrders from './pages/AdminOrders'
import AdminProducts from './pages/AdminProducts'
import AdminDashboard from './pages/AdminDashboard'
import PaymentResult from './pages/PaymentResult'

// Route chỉ dành cho user đã đăng nhập
function PrivateRoute({ children }) {
  const { auth, loading } = useContext(AuthContext)
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  return auth.isAuthenticated ? children : <Navigate to="/login" replace />
}

// Route dành cho Staff và Admin
function StaffAdminRoute({ children }) {
  const { auth, loading } = useContext(AuthContext)
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  return auth.isAuthenticated && ['Staff', 'Admin'].includes(auth.user?.role)
    ? children
    : <Navigate to="/" replace />
}

// Route chỉ dành cho Admin
function AdminRoute({ children }) {
  const { auth, loading } = useContext(AuthContext)
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  return auth.isAuthenticated && auth.user?.role === 'Admin'
    ? children
    : <Navigate to="/" replace />
}

// Route chỉ dành cho Customer
function CustomerRoute({ children }) {
  const { auth, loading } = useContext(AuthContext)
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  return auth.isAuthenticated && auth.user?.role === 'Customer'
    ? children
    : <Navigate to="/" replace />
}

const NO_LAYOUT_PAGES = ['/login', '/register', '/forgot-password', '/checkout/vnpay-simulator']

export default function App() {
  const { loading } = useContext(AuthContext)
  const location = useLocation()
  const isAuthPage = NO_LAYOUT_PAGES.includes(location.pathname)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--cream)' }}>
      {!isAuthPage && (
        <>
          <TopBar />
          <Header />
        </>
      )}

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/category/:category" element={<CategoryBrowse />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/payment-result" element={<PaymentResult />} />

          {/* Authenticated routes */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
          <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
          <Route path="/checkout/vnpay-simulator" element={<CustomerRoute><VNPaySimulator /></CustomerRoute>} />

          {/* Customer only — xem đơn của mình */}
          <Route path="/orders" element={<CustomerRoute><Orders /></CustomerRoute>} />

          {/* Staff + Admin — quản lý tất cả đơn hàng */}
          <Route path="/admin/orders" element={<StaffAdminRoute><AdminOrders /></StaffAdminRoute>} />
          <Route path="/admin/products" element={<StaffAdminRoute><AdminProducts /></StaffAdminRoute>} />

          {/* Admin only — dashboard & báo cáo */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  )
}
