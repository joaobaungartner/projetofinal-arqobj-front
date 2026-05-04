import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border/80 text-muted">
        <Icon size={28} className="opacity-90" strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-base font-semibold text-ink tracking-tight">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm text-muted max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
