import type { AppointmentStatus } from '@/lib/types'

const config: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDENTE: {
    label: 'Pendente',
    className: 'bg-warning-subtle text-warning',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    className: 'bg-brand-subtle text-brand',
  },
  CONCLUIDO: {
    label: 'Concluído',
    className: 'bg-success-subtle text-success',
  },
  CANCELADO: {
    label: 'Cancelado',
    className: 'bg-surface text-subtle border border-border',
  },
  RECUSADO: {
    label: 'Recusado',
    className: 'bg-danger-subtle text-danger',
  },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = config[status]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
