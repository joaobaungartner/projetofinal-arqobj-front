'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface SimpleModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  /** Painel mais estreito (ex.: formulários curtos) */
  narrow?: boolean
}

export function SimpleModal({ title, onClose, children, narrow }: SimpleModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="simple-modal-title"
        className={`relative max-h-[min(90vh,42rem)] w-full overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 ${narrow ? 'max-w-sm' : 'max-w-md'}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/80 bg-card/95 px-5 py-4 backdrop-blur-sm">
          <h2 id="simple-modal-title" className="text-sm font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="focus-ring rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
