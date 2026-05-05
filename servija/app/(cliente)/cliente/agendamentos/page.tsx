'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { agendamentosApi, avaliacoesApi, pagamentosApi } from '@/lib/api'
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
]

function AgendamentosContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [avaliadosIds, setAvaliadosIds] = useState<Set<string>>(new Set())
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
    if (!user?.clienteId) return
    setLoading(true)
    try {
      const [ags, avs] = await Promise.all([
        agendamentosApi.getByCliente(user.clienteId),
        avaliacoesApi.getAll(),
      ])
      setAgendamentos(ags)
      setAvaliadosIds(new Set(
        avs.filter((a) => a.clienteId === user.clienteId).map((a) => a.agendamentoId)
      ))
      await fetchPagamentos(ags)
    } catch {
      toastError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [user?.clienteId, toastError, fetchPagamentos])

  useEffect(() => { load() }, [load])

  const handleCancelar = async (id: string) => {
    setActionLoading(id)
    try { await agendamentosApi.cancelar(id); success('Agendamento cancelado'); load() }
    catch { toastError('Erro ao cancelar') }
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
      <h1 className="text-2xl font-semibold text-ink tracking-tight mb-1">Meus agendamentos</h1>
      <p className="text-sm text-muted mb-6">Acompanhe e gerencie seus agendamentos.</p>

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
            description={activeTab === 'ALL'
              ? 'Você ainda não fez nenhum agendamento.'
              : 'Nenhum agendamento nesta categoria.'}
            action={
              activeTab === 'ALL' ? (
                <Link href="/busca" className="btn-secondary-sm inline-flex">
                  Buscar prestadores
                </Link>
              ) : undefined
            }
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
                viewAs="cliente"
                pagamento={ag.status === 'CONCLUIDO' ? pagamento : undefined}
                actions={
                  <>
                    {ag.status === 'CONCLUIDO' && !avaliadosIds.has(ag.id) && (
                      <button
                        type="button"
                        onClick={() => router.push(`/avaliar/${ag.id}`)}
                        className="btn-primary-sm"
                      >
                        Avaliar
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
                        Confirmar pagamento
                      </button>
                    )}
                    {(ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') && (
                      <button
                        type="button"
                        onClick={() => handleCancelar(ag.id)}
                        disabled={actionLoading === ag.id}
                        className="btn-secondary-sm border-danger/25 text-danger hover:border-danger/35 hover:bg-danger-subtle"
                      >
                        {actionLoading === ag.id && <Loader2 size={13} className="animate-spin" />}
                        Cancelar
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

export default function AgendamentosPage() {
  return (
    <AuthGuard requiredRole="CLIENTE">
      <AgendamentosContent />
    </AuthGuard>
  )
}
