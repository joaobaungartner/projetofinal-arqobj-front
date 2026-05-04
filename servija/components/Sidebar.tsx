'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Clock,
  Heart,
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
]

const PRESTADOR_NAV: NavItem[] = [
  { href: '/prestador/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/prestador/agendamentos', label: 'Agendamentos', icon: CalendarCheck },
  { href: '/prestador/servicos', label: 'Serviços', icon: Scissors },
  { href: '/prestador/disponibilidades', label: 'Disponibilidade', icon: Clock },
]

interface SidebarProps {
  role: 'CLIENTE' | 'PRESTADOR'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const items = role === 'PRESTADOR' ? PRESTADOR_NAV : CLIENTE_NAV

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface min-h-[calc(100vh-56px)]">
      <nav className="flex flex-col gap-0.5 p-3 pt-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 h-9 px-3 rounded-md text-sm font-medium transition-colors duration-150
                ${active
                  ? 'bg-brand-subtle text-brand'
                  : 'text-muted hover:text-ink hover:bg-border/50'
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
