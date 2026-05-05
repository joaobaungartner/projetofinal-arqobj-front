'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Clock,
  Heart,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const CLIENTE_NAV: NavItem[] = [
  { href: '/cliente/agendamentos', label: 'Agendamentos', icon: CalendarCheck },
  { href: '/cliente/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/cliente/perfil', label: 'Perfil', icon: UserCircle },
]

const PRESTADOR_NAV: NavItem[] = [
  { href: '/prestador/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/prestador/agendamentos', label: 'Agendamentos', icon: CalendarCheck },
  { href: '/prestador/servicos', label: 'Serviços', icon: Scissors },
  { href: '/prestador/disponibilidades', label: 'Disponibilidade', icon: Clock },
  { href: '/prestador/perfil', label: 'Perfil', icon: UserCircle },
]

interface SidebarProps {
  role: 'CLIENTE' | 'PRESTADOR'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const items = role === 'PRESTADOR' ? PRESTADOR_NAV : CLIENTE_NAV

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/80 bg-card/40 backdrop-blur-sm min-h-[calc(100vh-3.5rem)]">
      <nav className="flex flex-col gap-1 p-3 pt-5">
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200
                ${active
                  ? 'bg-brand-subtle text-brand shadow-sm'
                  : 'text-muted hover:text-ink hover:bg-surface/80'
                }`}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
