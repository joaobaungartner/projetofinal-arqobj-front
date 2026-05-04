'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { agendamentosApi } from '@/lib/api'
import type { Agendamento, AppointmentStatus } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { AppointmentCard } from '@/components/AppointmentCard'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'
import { AppointmentCardSkeleton } from '@/components/LoadingSkeleton'

const TABS: { label: string; status: AppointmentStatus | 'ALL' }[] = [
  { label: 'Todos', status: 'ALL' },
  { label: 'Pendentes', status: 'PENDENTE' },
  { label: 'Confirmados', status: 'CONFIRMADO' },
  { label: 'Concluídos', status: 'CONCLUIDO' },
  { label: 'Cancelados', status: 'CANCELADO' },
  { label: 'Recusados', status: 'RECUSADO' },
]

function AgendamentosContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!user?.prestadorId) return
    setLoading(true)
    try {
      setAgendamentos(await agendamentosApi.getByPrestador(user.prestadorId))
    } catch {
      toastError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [user?.prestadorId, toastError])

  useEffect(() => { load() }, [load])

  const doAction = async (id: number, fn: (id: number) => Promise<unknown>, msg: string) => {
    setActionLoading(id)
    try { await fn(id); success(msg); load() }
    catch { toastError('Erro ao executar ação') }
    finally { setActionLoading(null) }
  }

  const filtered = activeTab === 'ALL'
    ? agendamentos
    : agendamentos.filter((a) => a.status === activeTab)

  const countByTab = (status: AppointmentStatus | 'ALL') =>
    status === 'ALL' ? agendamentos.length : agendamentos.filter((a) => a.status === status).length

  return (
    <PageWrapper>
      <h1 className="text-2xl font-semibold text-ink tracking-tight mb-6">Agendamentos</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5">
        {TABS.map((tab) => {
          const count = countByTab(tab.status)
          return (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`shrink-0 h-8 px-3 rounded-md text-xs font-medium transition-colors duration-150 inline-flex items-center gap-1.5
                ${activeTab === tab.status
                  ? 'bg-brand-subtle text-brand'
                  : 'text-muted hover:text-ink hover:bg-surface'
                }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs rounded-sm px-1 py-0.5 tabular-nums
                  ${activeTab === tab.status ? 'bg-brand/15' : 'bg-border'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <AppointmentCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg">
          <EmptyState
            icon={CalendarCheck}
            title="Nenhum agendamento"
            description="Não há agendamentos nesta categoria."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ag) => (
            <AppointmentCard
              key={ag.id}
              agendamento={ag}
              viewAs="prestador"
              actions={
                <>
                  {ag.status === 'PENDENTE' && (
                    <>
                      <button
                        onClick={() => doAction(ag.id, agendamentosApi.confirmar, 'Confirmado!')}
                        disabled={actionLoading === ag.id}
                        className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98] disabled:opacity-40 inline-flex items-center gap-1.5"
                      >
                        {actionLoading === ag.id && <Loader2 size={13} className="animate-spin" />}
                        Confirmar
                      </button>
                      <button
                        onClick={() => doAction(ag.id, agendamentosApi.recusar, 'Recusado')}
                        disabled={actionLoading === ag.id}
                        className="h-9 px-4 rounded-md border border-border text-sm font-medium text-danger hover:bg-danger-subtle hover:border-danger/30 transition-colors duration-150 disabled:opacity-40"
                      >
                        Recusar
                      </button>
                    </>
                  )}
                  {ag.status === 'CONFIRMADO' && (
                    <button
                      onClick={() => doAction(ag.id, agendamentosApi.concluir, 'Concluído!')}
                      disabled={actionLoading === ag.id}
                      className="h-9 px-4 rounded-md bg-success text-white text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 inline-flex items-center gap-1.5"
                    >
                      {actionLoading === ag.id && <Loader2 size={13} className="animate-spin" />}
                      Concluir serviço
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

export default function PrestadorAgendamentosPage() {
  return (
    <AuthGuard requiredRole="PRESTADOR">
      <AgendamentosContent />
    </AuthGuard>
  )
}
