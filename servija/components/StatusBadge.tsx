import type { AppointmentStatus } from '@/lib/types'

const config: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDENTE: {
    label: 'Pendente',
    className: 'bg-warning-subtle text-warning border-warning/25',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    className: 'bg-brand-subtle text-brand border-brand/20',
  },
  CONCLUIDO: {
    label: 'Concluído',
    className: 'bg-success-subtle text-success border-success/25',
  },
  CANCELADO: {
    label: 'Cancelado',
    className: 'bg-surface text-subtle border-border',
  },
  RECUSADO: {
    label: 'Recusado',
    className: 'bg-danger-subtle text-danger border-danger/25',
  },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = config[status]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  )
}
