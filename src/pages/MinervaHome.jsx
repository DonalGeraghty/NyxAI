import React from 'react'
import { Link } from 'react-router-dom'
import './HubPage.css'
import './MinervaHome.css'

function MinervaHome() {
  return (
    <main className="hub-page minerva-home">
      <div className="hub-inner">
        <header className="hub-header">
          <h1 className="hub-title">Minerva</h1>
          <p className="hub-sub">Your private account, presented in a focused night-mode interface.</p>
        </header>

        <p className="hub-body">Review your profile and account settings below.</p>

        <ul className="minerva-home-grid" aria-label="Account options">
          <li>
            <Link to="/account" className="minerva-home-card">
              <span className="minerva-home-card-title">Account</span>
              <span className="minerva-home-card-blurb">Profile and settings.</span>
            </Link>
          </li>
        </ul>
      </div>
    </main>
  )
}

export default MinervaHome
