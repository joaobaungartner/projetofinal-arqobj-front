'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { agendamentosApi, pagamentosApi } from '@/lib/api'
import type { Agendamento, AppointmentStatus, Pagamento } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { AppointmentCard } from '@/components/AppointmentCard'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'
import { AppointmentCardSkeleton } from '@/components/LoadingSkeleton'
import { ScrollFilterTabs } from '@/components/ScrollFilterTabs'

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
  const [pagamentosMap, setPagamentosMap] = useState<Map<string, Pagamento | null>>(new Map())
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPagamentos = useCallback(async (ags: Agendamento[]) => {
    const concluidos = ags.filter((a) => a.status === 'CONCLUIDO')
    if (concluidos.length === 0) return
    const results = await Promise.allSettled(
      concluidos.map((a) => pagamentosApi.getByAgendamento(a.id))
    )
    const map = new Map<string, Pagamento | null>()
    concluidos.forEach((a, i) => {
      const r = results[i]
      map.set(a.id, r.status === 'fulfilled' ? r.value : null)
    })
    setPagamentosMap(map)
  }, [])

  const load = useCallback(async () => {
    if (!user?.prestadorId) return
    setLoading(true)
    try {
      const ags = await agendamentosApi.getByPrestador(user.prestadorId)
      setAgendamentos(ags)
      await fetchPagamentos(ags)
    } catch {
      toastError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [user?.prestadorId, toastError, fetchPagamentos])

  useEffect(() => { load() }, [load])

  const doAction = async (id: string, fn: (id: string) => Promise<unknown>, msg: string) => {
    setActionLoading(id)
    try { await fn(id); success(msg); load() }
    catch { toastError('Erro ao executar ação') }
    finally { setActionLoading(null) }
  }

  const handleMarcarPago = async (pagamento: Pagamento) => {
    setActionLoading(pagamento.id)
    try {
      const updated = await pagamentosApi.marcarPago(pagamento.id)
      setPagamentosMap((prev) => new Map(prev).set(updated.agendamentoId, updated))
      success('Pagamento registrado!')
    } catch {
      toastError('Erro ao registrar pagamento')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = activeTab === 'ALL'
    ? agendamentos
    : agendamentos.filter((a) => a.status === activeTab)

  const countByTab = (status: AppointmentStatus | 'ALL') =>
    status === 'ALL' ? agendamentos.length : agendamentos.filter((a) => a.status === status).length

  return (
    <PageWrapper>
      <h1 className="text-2xl font-semibold text-ink tracking-tight mb-1">Agendamentos</h1>
      <p className="text-sm text-muted mb-6">Filtre por status e confira as próximas ações.</p>

      <ScrollFilterTabs
        tabs={TABS.map((t) => ({ key: String(t.status), label: t.label }))}
        active={String(activeTab)}
        onChange={(k) => setActiveTab(k as AppointmentStatus | 'ALL')}
        countFor={(k) => countByTab(k as AppointmentStatus | 'ALL')}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <AppointmentCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface overflow-hidden">
          <EmptyState
            icon={CalendarCheck}
            title="Nenhum agendamento"
            description="Não há agendamentos nesta categoria."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ag) => {
            const pagamento = pagamentosMap.get(ag.id)
            return (
              <AppointmentCard
                key={ag.id}
                agendamento={ag}
                viewAs="prestador"
                pagamento={ag.status === 'CONCLUIDO' ? pagamento : undefined}
                actions={
                  <>
                    {ag.status === 'PENDENTE' && (
                      <>
                        <button
                          type="button"
                          onClick={() => doAction(ag.id, agendamentosApi.confirmar, 'Confirmado!')}
                          disabled={actionLoading === ag.id}
                          className="btn-primary-sm"
                        >
                          {actionLoading === ag.id && <Loader2 size={13} className="animate-spin" />}
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => doAction(ag.id, agendamentosApi.recusar, 'Recusado')}
                          disabled={actionLoading === ag.id}
                          className="btn-secondary-sm border-danger/25 text-danger hover:border-danger/35 hover:bg-danger-subtle"
                        >
                          Recusar
                        </button>
                      </>
                    )}
                    {ag.status === 'CONFIRMADO' && (
                      <button
                        type="button"
                        onClick={() => doAction(ag.id, agendamentosApi.concluir, 'Concluído!')}
                        disabled={actionLoading === ag.id}
                        className="btn-success-sm"
                      >
                        {actionLoading === ag.id && <Loader2 size={13} className="animate-spin" />}
                        Concluir serviço
                      </button>
                    )}
                    {ag.status === 'CONCLUIDO' && pagamento?.status === 'PENDENTE' && (
                      <button
                        type="button"
                        onClick={() => handleMarcarPago(pagamento)}
                        disabled={actionLoading === pagamento.id}
                        className="btn-success-sm"
                      >
                        {actionLoading === pagamento.id && <Loader2 size={13} className="animate-spin" />}
                        Marcar como pago
                      </button>
                    )}
                  </>
                }
              />
            )
          })}
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
