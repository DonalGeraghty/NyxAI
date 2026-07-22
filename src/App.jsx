import React, { useEffect, useState } from 'react'
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
import LoginSplash from './pages/LoginSplash'
import MinervaHome from './pages/MinervaHome'
import { AuthProvider, useAuth } from './context/AuthContext'

function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleLogout = () => {
    setMenuOpen(false)
    setProfileOpen(false)
    logout()
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
            <h2>Minerva</h2>
          </Link>
        </div>

        <div className="nav-right nav-right--desktop">
          <p className="nav-time-muted">
            {currentTime.toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
            {currentTime.toLocaleTimeString('en-IE', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="nav-dropdown-wrap">
            <button
              type="button"
              className="nav-link nav-dropdown-btn"
              data-testid="nav-profile-menu"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
            >
              Profile
            </button>
            <div className={`nav-dropdown-menu nav-dropdown-menu--profile ${profileOpen ? 'is-open' : ''}`} aria-hidden={!profileOpen}>
              {user?.email && <span className="nav-user-email" title={user.email}>{user.email}</span>}
              <Link to="/account" className="nav-dropdown-link" onClick={scrollToTop}>
                Account
              </Link>
              <button
                type="button"
                className="nav-dropdown-link nav-dropdown-link-btn nav-logout"
                data-testid="nav-sign-out"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="nav-mobile-controls">
          <button
            type="button"
            className="nav-hamburger"
            data-testid="nav-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`nav-hamburger-icon ${menuOpen ? 'is-open' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`nav-drawer ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        {user?.email && <span className="nav-drawer-email">{user.email}</span>}
        <Link to="/account" className="nav-drawer-link" onClick={scrollToTop}>
          Account
        </Link>
        <button type="button" className="nav-drawer-link nav-drawer-logout" data-testid="nav-drawer-sign-out" onClick={handleLogout}>
          Sign out
        </button>
        <div className="nav-drawer-time">
          {currentTime.toLocaleDateString('en-IE', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}{' '}
          {currentTime.toLocaleTimeString('en-IE', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
        <Route path="/" element={<MinervaHome />} />
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
