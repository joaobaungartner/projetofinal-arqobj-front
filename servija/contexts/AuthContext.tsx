'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { authApi, clientesApi, prestadoresApi } from '@/lib/api'
import type { UserRole } from '@/lib/types'

interface AuthUser {
  email: string
  role: UserRole
  clienteId?: string
  prestadorId?: string
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

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function normalizeRole(role: string): UserRole {
  const stripped = role.startsWith('ROLE_') ? role.slice(5) : role
  return stripped as UserRole
}

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

    const normalizedRole = normalizeRole(res.role)
    const payload = decodeJwtPayload(newToken)
    const userId = payload?.sub as string | undefined

    let authUser: AuthUser = { email, role: normalizedRole }

    if (userId) {
      try {
        if (normalizedRole === 'CLIENTE') {
          const cliente = await clientesApi.getById(userId)
          authUser = { ...authUser, clienteId: userId, nome: cliente.nome }
        } else if (normalizedRole === 'PRESTADOR') {
          const prestador = await prestadoresApi.getById(userId)
          authUser = { ...authUser, prestadorId: userId, nome: prestador.nome }
        }
      } catch {
        // Se falhar ao buscar nome, ainda mantém o userId
        if (normalizedRole === 'CLIENTE') {
          authUser = { ...authUser, clienteId: userId }
        } else if (normalizedRole === 'PRESTADOR') {
          authUser = { ...authUser, prestadorId: userId }
        }
      }
    }

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
