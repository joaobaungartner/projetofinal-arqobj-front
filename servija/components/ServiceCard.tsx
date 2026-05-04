import { Clock, Check } from 'lucide-react'
import type { Servico } from '@/lib/types'
import { formatCurrency, formatDuration } from '@/lib/utils'

interface ServiceCardProps {
  servico: Servico
  onSelect?: (servico: Servico) => void
  selected?: boolean
  action?: React.ReactNode
}

export function ServiceCard({ servico, onSelect, selected, action }: ServiceCardProps) {
  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? (e) => e.key === 'Enter' && onSelect(servico) : undefined}
      onClick={() => onSelect?.(servico)}
      className={`bg-card border rounded-xl p-5 shadow-sm shadow-black/[0.03] transition-all duration-200 ease-out
        ${onSelect ? 'cursor-pointer' : ''}
        ${selected
          ? 'border-brand ring-2 ring-brand/20 shadow-md'
          : onSelect
            ? 'border-border hover:border-border-strong hover:-translate-y-0.5 hover:shadow-md'
            : 'border-border'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-ink truncate">{servico.nome}</h3>
          {servico.descricao && (
            <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
              {servico.descricao}
            </p>
          )}
        </div>
        {selected && (
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
            <Check size={12} strokeWidth={2.5} className="text-white" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-base font-semibold text-ink tabular-nums">
          {formatCurrency(servico.preco)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted bg-surface border border-border px-2 py-0.5 rounded-sm">
          <Clock size={11} strokeWidth={1.75} />
          {formatDuration(servico.duracaoMinutos)}
        </span>
      </div>

      {action && <div className="mt-3 pt-3 border-t border-border">{action}</div>}
    </div>
  )
}
