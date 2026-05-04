'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { authApi } from '@/lib/api'
import type { UserRole, Cliente, Prestador } from '@/lib/types'

interface AuthUser {
  email: string
  role: UserRole
  clienteId?: number
  prestadorId?: number
  nome?: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  role: UserRole | null
  login: (email: string, senha: string, tipo: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'servija_token'
const USER_KEY = 'servija_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {}
    }
    setReady(true)
  }, [])

  const login = useCallback(async (email: string, senha: string, tipo: UserRole) => {
    const res = await authApi.login(email, senha, tipo)
    const newToken = res.token
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)

    let authUser: AuthUser = { email, role: res.role as UserRole }

    try {
      if (res.role === 'CLIENTE') {
        const clientes = await fetch('http://localhost:8080/clientes', {
          headers: { Authorization: `Bearer ${newToken}` },
        }).then((r) => r.json() as Promise<Cliente[]>)
        const found = Array.isArray(clientes)
          ? clientes.find((c) => c.email === email)
          : null
        if (found) {
          authUser = { ...authUser, clienteId: found.id, nome: found.nome }
        }
      } else if (res.role === 'PRESTADOR') {
        const prestadores = await fetch('http://localhost:8080/prestadores', {
          headers: { Authorization: `Bearer ${newToken}` },
        }).then((r) => r.json() as Promise<Prestador[]>)
        const found = Array.isArray(prestadores)
          ? prestadores.find((p) => p.email === email)
          : null
        if (found) {
          authUser = { ...authUser, prestadorId: found.id, nome: found.nome }
        }
      }
    } catch {}

    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  if (!ready) return null

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
