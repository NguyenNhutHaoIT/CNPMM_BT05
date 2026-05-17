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

function PrivateRoute({ children }) {
  const { auth, loading } = useContext(AuthContext)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }
  return auth.isAuthenticated ? children : <Navigate to="/login" replace />
}

const NO_LAYOUT_PAGES = ['/login', '/register', '/forgot-password']

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
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  )
}
