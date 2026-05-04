'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/lib/types'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, role } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    if (requiredRole && role !== requiredRole) {
      router.push('/')
    }
  }, [isAuthenticated, role, requiredRole, router, pathname])

  if (!isAuthenticated) return null
  if (requiredRole && role !== requiredRole) return null

  return <>{children}</>
}
