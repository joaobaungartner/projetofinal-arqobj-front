'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from '@/lib/utils'

export function Navbar() {
  const { isAuthenticated, role, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  const dashboardHref =
    role === 'PRESTADOR' ? '/prestador/dashboard' : '/cliente/agendamentos'

  const navLinks = [
    { href: '/busca', label: 'Buscar serviços' },
    ...(isAuthenticated
      ? [{ href: dashboardHref, label: role === 'PRESTADOR' ? 'Dashboard' : 'Agendamentos' }]
      : []),
  ]

  return (
    <header className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center px-6">
      <div className="max-w-screen-xl mx-auto w-full flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-semibold text-base text-ink tracking-tight shrink-0"
        >
          Servi<span className="text-brand">Já</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 h-8 rounded-md flex items-center text-sm font-medium transition-colors duration-150
                ${pathname.startsWith(link.href)
                  ? 'bg-brand-subtle text-brand'
                  : 'text-muted hover:text-ink hover:bg-surface'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-ink hover:bg-surface transition-colors duration-150 focus-ring"
              >
                <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {getInitials(user?.nome ?? user?.email ?? 'U')}
                </div>
                <span className="max-w-28 truncate text-sm">{user?.nome ?? user?.email}</span>
                <ChevronDown size={14} className="text-subtle" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-md z-20 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-danger hover:bg-danger-subtle transition-colors duration-150"
                    >
                      <LogOut size={14} />
                      Sair da conta
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="h-9 px-4 rounded-md text-sm font-medium text-muted hover:text-ink hover:bg-surface transition-colors duration-150"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98]"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md text-muted hover:text-ink hover:bg-surface transition-colors duration-150"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border px-4 py-3 flex flex-col gap-1 md:hidden shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`px-3 h-10 rounded-md flex items-center text-sm font-medium transition-colors duration-150
                ${pathname.startsWith(link.href)
                  ? 'bg-brand-subtle text-brand'
                  : 'text-ink hover:bg-surface'
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border my-1 pt-1">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 h-10 rounded-md text-sm text-muted hover:text-danger hover:bg-danger-subtle transition-colors duration-150"
              >
                <LogOut size={14} />
                Sair da conta
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-3 h-10 rounded-md text-sm font-medium text-ink hover:bg-surface"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center justify-center h-10 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
