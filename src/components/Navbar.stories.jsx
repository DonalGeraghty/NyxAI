import React from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

function NavbarPreview() {
  return (
    <Router>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/" className="nav-logo-link is-active">
              <h2>Minerva</h2>
            </Link>
          </div>
          <div className="nav-right nav-right--desktop">
            <p className="nav-time-muted">Wed, Jul 22 21:30:00</p>
            <button type="button" className="nav-link nav-dropdown-btn">
              Profile
            </button>
          </div>
        </div>
      </nav>
    </Router>
  )
}

export default {
  title: 'Components/Navbar',
  component: NavbarPreview,
  parameters: { layout: 'fullscreen' },
}

export const NightMode = {}
