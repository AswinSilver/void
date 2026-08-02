import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, AuthUser } from '@/api/endpoints'

// Dev mode mock user - used when backend is unavailable
const MOCK_USER: AuthUser = {
  id: 'dev-user-001',
  email: 'analyst@void.security',
  username: 'analyst',
  full_name: 'SOC Analyst',
  role: 'analyst',
  avatar_url: undefined,
}

const DEV_MODE = import.meta.env.DEV

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: { email: string; username: string; full_name?: string; password: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token === 'dev-mock-token') {
      // Dev mode: already mock-authenticated
      setUser(MOCK_USER)
      setIsLoading(false)
      return
    }
    if (token) {
      authApi.getMe()
        .then(setUser)
        .catch(() => {
          if (DEV_MODE) {
            // In dev mode with no backend, keep the mock user
            setUser(MOCK_USER)
          } else {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login({ username: email, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      setUser(data.user)
    } catch (err: any) {
      // Dev mode fallback: any network error → mock login
      if (DEV_MODE && (err?.code === 'ERR_NETWORK' || err?.response?.status === undefined || !err?.response)) {
        localStorage.setItem('access_token', 'dev-mock-token')
        setUser(MOCK_USER)
        return
      }
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const register = async (registerData: { email: string; username: string; full_name?: string; password: string }) => {
    try {
      await authApi.register(registerData)
    } catch (err: any) {
      // Dev mode: silently succeed registration
      if (DEV_MODE && !err?.response) return
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
