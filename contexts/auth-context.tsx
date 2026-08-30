'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, logout as apiLogout, getMe, ApiError, type BackendUser } from '@/lib/api'

interface Admin {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function toDisplayAdmin(backendUser: BackendUser): Admin {
  // The backend's User model has no separate "username" field (it logs
  // in with email) -- existing screens expect { id, username, email }
  // though, so we derive a display username from the email's local part.
  return {
    id: String(backendUser.id),
    username: backendUser.email.split('@')[0],
    email: backendUser.email,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  // Starts true and covers both the one-time startup check (is there
  // already a valid token?) and the login submission itself -- the page
  // that renders <LoginForm> waits for this before showing the form at
  // all, so there's no "Signing in..." flash on first load either way.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // On load, check for an existing token and confirm it's still valid
  // (rather than trusting whatever was last saved) by re-fetching /auth/me/.
  useEffect(() => {
    let cancelled = false

    getMe()
      .then((backendUser) => {
        if (cancelled) return
        if (backendUser && backendUser.is_staff) {
          setAdmin(toDisplayAdmin(backendUser))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const backendUser = await apiLogin(email, password)
      setAdmin(toDisplayAdmin(backendUser))
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiLogout()
    setAdmin(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
