import React from 'react'
import {
  BrowserRouter as Router,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import AccountPage from './pages/AccountPage'
import DataPage from './pages/DataPage'
import LoginSplash from './pages/LoginSplash'
import NyxAIHome from './pages/NyxAIHome'
import { AuthProvider, useAuth } from './context/AuthContext'

function Navbar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link
            to="/"
            className={`nav-logo-link${location.pathname === '/' ? ' is-active' : ''}`}
            onClick={scrollToTop}
          >
            <h2>NyxAI</h2>
          </Link>
        </div>
        <div className="nav-actions">
          {user?.email && <span className="nav-user-email">{user.email}</span>}
          <Link to="/data" className="nav-action" onClick={scrollToTop}>
            Data
          </Link>
          <Link to="/account" className="nav-action" onClick={scrollToTop}>
            Account
          </Link>
          <button type="button" className="nav-action" data-testid="nav-sign-out" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) return <LoginSplash />

  return (
    <div className="app">
      <Navbar />
      <Outlet />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<NyxAIHome />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
