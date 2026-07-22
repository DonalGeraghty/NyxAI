import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  API_BASE_URL,
  API_ENDPOINTS,
  authFetch,
  getStoredToken,
  setStoredToken,
} from '../config/api'

const AuthContext = createContext(null)
const DEMO_TOKEN = 'local-demo-session'
const DEMO_USER = { email: 'demo@nyxai.local', isDemo: true }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setStoredToken('')
    setUser(null)
  }, [])

  const bootstrap = useCallback(async () => {
    const token = getStoredToken()
    if (import.meta.env.DEV && token === DEMO_TOKEN) {
      setUser(DEMO_USER)
      setLoading(false)
      return
    }
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await authFetch(API_ENDPOINTS.AUTH_ME, { method: 'GET' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.user?.email) {
        setUser({ email: data.user.email })
      } else {
        setStoredToken('')
        setUser(null)
      }
    } catch {
      setStoredToken('')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loginAsDemo = useCallback(() => {
    if (!import.meta.env.DEV) return
    setStoredToken(DEMO_TOKEN)
    setUser(DEMO_USER)
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data.error || 'Login failed'
      throw new Error(msg)
    }
    setStoredToken(data.token)
    setUser({ email: data.user?.email || email })
    return data
  }, [])

  const register = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data.error || 'Registration failed'
      throw new Error(msg)
    }
    setStoredToken(data.token)
    setUser({ email: data.user?.email || email })
    return data
  }, [])

  const deleteAccount = useCallback(async (password) => {
    if (!user?.email) throw new Error('Not signed in')
    const res = await authFetch(API_ENDPOINTS.AUTH_DELETE_ACCOUNT, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Could not delete account')
    }
    setStoredToken('')
    setUser(null)
  }, [user?.email])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      loginAsDemo,
      register,
      logout,
      deleteAccount,
      refreshSession: bootstrap,
    }),
    [user, loading, login, loginAsDemo, register, logout, deleteAccount, bootstrap]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
