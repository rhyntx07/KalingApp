'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Admin {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize from localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin')
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Demo credentials: admin / admin123
      if (username === 'admin' && password === 'admin123') {
        const adminData: Admin = {
          id: '1',
          username: 'admin',
          email: 'admin@kalingapp.com',
        }
        setAdmin(adminData)
        localStorage.setItem('admin', JSON.stringify(adminData))
      } else {
        throw new Error('Invalid username or password')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('admin')
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
