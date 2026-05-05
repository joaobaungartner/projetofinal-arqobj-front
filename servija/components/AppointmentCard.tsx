import { Calendar, CreditCard, Banknote, Coins, CheckCircle2, Clock3, RotateCcw } from 'lucide-react'
import type { Agendamento, Pagamento, PaymentMethod, PaymentStatus } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

interface AppointmentCardProps {
  agendamento: Agendamento
  viewAs: 'cliente' | 'prestador'
  pagamento?: Pagamento | null
  actions?: React.ReactNode
}

const paymentMethodIcons: Record<PaymentMethod, typeof Coins> = {
  CARTAO: CreditCard,
  PIX: Coins,
  DINHEIRO: Banknote,
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CARTAO: 'Cartão',
  PIX: 'Pix',
  DINHEIRO: 'Dinheiro',
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; colorClass: string; Icon: typeof CheckCircle2 }> = {
  PENDENTE:     { label: 'Pagamento pendente', colorClass: 'text-warning',  Icon: Clock3 },
  PAGO:         { label: 'Pago',               colorClass: 'text-success',  Icon: CheckCircle2 },
  CANCELADO:    { label: 'Pagamento cancelado', colorClass: 'text-subtle',   Icon: Clock3 },
  REEMBOLSADO:  { label: 'Reembolsado',        colorClass: 'text-subtle',   Icon: RotateCcw },
}

export function AppointmentCard({ agendamento, viewAs, pagamento, actions }: AppointmentCardProps) {
  const dataExibicao = agendamento.dataHoraInicio
  const pInfo = pagamento ? paymentStatusConfig[pagamento.status] : null
  const MethodIcon = pagamento ? paymentMethodIcons[pagamento.metodo] : null

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm shadow-black/[0.03] transition-shadow duration-200 hover:shadow-md">
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
        {dataExibicao && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Calendar size={12} strokeWidth={1.75} />
            {formatDate(dataExibicao)}
          </span>
        )}
        {agendamento.servicoPreco != null && (
          <span className="inline-flex items-center gap-1 text-xs text-muted tabular-nums">
            <Coins size={12} strokeWidth={1.75} />
            {formatCurrency(agendamento.servicoPreco)}
          </span>
        )}
      </div>

      {agendamento.observacaoCliente && (
        <p className="mt-2 text-xs text-subtle italic leading-relaxed">
          {agendamento.observacaoCliente}
        </p>
      )}

      {pagamento && pInfo && MethodIcon && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <MethodIcon size={12} strokeWidth={1.75} className="text-muted shrink-0" />
          <span className="text-xs text-muted">{paymentMethodLabels[pagamento.metodo]}</span>
          <span className="text-subtle text-xs select-none">·</span>
          <pInfo.Icon size={12} strokeWidth={1.75} className={`shrink-0 ${pInfo.colorClass}`} />
          <span className={`text-xs ${pInfo.colorClass}`}>{pInfo.label}</span>
        </div>
      )}

      {actions && (
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
