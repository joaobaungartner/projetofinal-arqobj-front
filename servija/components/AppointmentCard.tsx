import { Calendar, CreditCard, Banknote, Coins } from 'lucide-react'
import type { Agendamento } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

interface AppointmentCardProps {
  agendamento: Agendamento
  viewAs: 'cliente' | 'prestador'
  actions?: React.ReactNode
}

const paymentIcons = {
  CARTAO: CreditCard,
  PIX: Coins,
  DINHEIRO: Banknote,
} as const

const paymentLabels = {
  CARTAO: 'Cartão',
  PIX: 'Pix',
  DINHEIRO: 'Dinheiro',
} as const

export function AppointmentCard({ agendamento, viewAs, actions }: AppointmentCardProps) {
  const PayIcon = paymentIcons[agendamento.formaPagamento]

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">
            {agendamento.servicoNome ?? 'Serviço'}
          </p>
          <p className="text-xs text-muted mt-0.5 truncate">
            {viewAs === 'cliente'
              ? agendamento.prestadorNome ?? 'Prestador'
              : agendamento.clienteNome ?? 'Cliente'}
          </p>
        </div>
        <StatusBadge status={agendamento.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Calendar size={12} strokeWidth={1.75} />
          {formatDate(agendamento.dataHora)}
        </span>
        {agendamento.servicoPreco != null && (
          <span className="inline-flex items-center gap-1 text-xs text-muted tabular-nums">
            <PayIcon size={12} strokeWidth={1.75} />
            {formatCurrency(agendamento.servicoPreco)} · {paymentLabels[agendamento.formaPagamento]}
          </span>
        )}
      </div>

      {agendamento.observacao && (
        <p className="mt-2 text-xs text-subtle italic leading-relaxed">
          {agendamento.observacao}
        </p>
      )}

      {actions && (
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
