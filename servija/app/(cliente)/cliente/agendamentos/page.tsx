'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { agendamentosApi, avaliacoesApi } from '@/lib/api'
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
]

function AgendamentosContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [avaliadosIds, setAvaliadosIds] = useState<Set<number>>(new Set())
  const [actionLoading, setActionLoading] = useState<number | null>(null)

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
    } catch {
      toastError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [user?.clienteId, toastError])

  useEffect(() => { load() }, [load])

  const handleCancelar = async (id: number) => {
    setActionLoading(id)
    try { await agendamentosApi.cancelar(id); success('Agendamento cancelado'); load() }
    catch { toastError('Erro ao cancelar') }
    finally { setActionLoading(null) }
  }

  const filtered = activeTab === 'ALL'
    ? agendamentos
    : agendamentos.filter((a) => a.status === activeTab)

  const countByTab = (status: AppointmentStatus | 'ALL') =>
    status === 'ALL' ? agendamentos.length : agendamentos.filter((a) => a.status === status).length

  return (
    <PageWrapper>
      <h1 className="text-2xl font-semibold text-ink tracking-tight mb-6">Meus agendamentos</h1>

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
            description={activeTab === 'ALL'
              ? 'Você ainda não fez nenhum agendamento.'
              : 'Nenhum agendamento nesta categoria.'}
            action={
              activeTab === 'ALL' ? (
                <a
                  href="/busca"
                  className="h-9 px-4 rounded-md border border-border-strong text-sm font-medium text-ink hover:bg-surface transition-colors duration-150 inline-block leading-9"
                >
                  Buscar prestadores
                </a>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ag) => (
            <AppointmentCard
              key={ag.id}
              agendamento={ag}
              viewAs="cliente"
              actions={
                <>
                  {ag.status === 'CONCLUIDO' && !avaliadosIds.has(ag.id) && (
                    <button
                      onClick={() => router.push(`/avaliar/${ag.id}`)}
                      className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98]"
                    >
                      Avaliar
                    </button>
                  )}
                  {(ag.status === 'PENDENTE' || ag.status === 'CONFIRMADO') && (
                    <button
                      onClick={() => handleCancelar(ag.id)}
                      disabled={actionLoading === ag.id}
                      className="h-9 px-4 rounded-md border border-border text-sm font-medium text-danger hover:bg-danger-subtle hover:border-danger/30 transition-colors duration-150 active:scale-[0.98] disabled:opacity-40 inline-flex items-center gap-1.5"
                    >
                      {actionLoading === ag.id && <Loader2 size={13} className="animate-spin" />}
                      Cancelar
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

export default function AgendamentosPage() {
  return (
    <AuthGuard requiredRole="CLIENTE">
      <AgendamentosContent />
    </AuthGuard>
  )
}
