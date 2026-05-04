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
  { href: '/prestador/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/prestador/agendamentos', label: 'Agenda', icon: CalendarCheck },
  { href: '/prestador/servicos', label: 'Serviços', icon: Scissors },
  { href: '/prestador/disponibilidades', label: 'Horários', icon: Clock },
]

interface MobileAppNavProps {
  role: 'CLIENTE' | 'PRESTADOR'
}

export function MobileAppNav({ role }: MobileAppNavProps) {
  const pathname = usePathname()
  const items = role === 'PRESTADOR' ? PRESTADOR_NAV : CLIENTE_NAV

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.08)]"
      aria-label="Navegação da área logada"
    >
      <ul className="flex items-stretch justify-around gap-0.5 px-1 pt-1">
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg text-[10px] font-medium leading-tight transition-colors duration-200
                  ${active
                    ? 'text-brand bg-brand-subtle'
                    : 'text-muted hover:text-ink hover:bg-surface'
                  }`}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} className="shrink-0" aria-hidden />
                <span className="truncate max-w-full text-center">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
