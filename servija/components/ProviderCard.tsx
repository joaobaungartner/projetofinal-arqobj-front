import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { Prestador } from '@/lib/types'
import { getInitials, formatCurrency } from '@/lib/utils'
import { StarRating } from './StarRating'

interface ProviderCardProps {
  prestador: Prestador & { menorPreco?: number }
}

export function ProviderCard({ prestador }: ProviderCardProps) {
  return (
    <Link
      href={`/prestadores/${prestador.id}`}
      className="block bg-card border border-border rounded-lg p-5 hover:border-border-strong hover:-translate-y-px transition-all duration-150 group"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold shrink-0"
          aria-label={`Avatar de ${prestador.nome}`}
        >
          {getInitials(prestador.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-ink truncate group-hover:text-brand transition-colors duration-150">
            {prestador.nome}
          </h3>
          {prestador.categoriaNome && (
            <span className="inline-flex items-center mt-1 text-xs text-muted bg-surface border border-border px-2 py-0.5 rounded-sm">
              {prestador.categoriaNome}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {(prestador.notaMedia ?? 0) > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={prestador.notaMedia!} size="sm" />
            {prestador.totalAvaliacoes != null && (
              <span className="text-xs text-subtle">
                ({prestador.totalAvaliacoes})
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">
            {prestador.cidade}
            {prestador.bairro ? `, ${prestador.bairro}` : ''}
          </span>
        </div>
        {prestador.menorPreco != null && (
          <p className="text-xs text-muted">
            A partir de{' '}
            <span className="font-medium text-ink tabular-nums">
              {formatCurrency(prestador.menorPreco)}
            </span>
          </p>
        )}
      </div>
    </Link>
  )
}
