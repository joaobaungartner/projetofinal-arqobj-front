'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CalendarCheck, Scissors, Clock, Loader2, TrendingUp } from 'lucide-react'
import { agendamentosApi } from '@/lib/api'
import type { Agendamento } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { AppointmentCard } from '@/components/AppointmentCard'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'
import { MetricCardSkeleton, AppointmentCardSkeleton } from '@/components/LoadingSkeleton'

function DashboardContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
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

  const pendentes = agendamentos.filter((a) => a.status === 'PENDENTE')
  const hoje = new Date().toDateString()
  const confirmadosHoje = agendamentos.filter(
    (a) => a.status === 'CONFIRMADO' && new Date(a.dataHora).toDateString() === hoje
  )
  const concluidos = agendamentos.filter((a) => a.status === 'CONCLUIDO').length

  const doAction = async (id: number, fn: (id: number) => Promise<unknown>, msg: string) => {
    setActionLoading(id)
    try {
      await fn(id)
      success(msg)
      load()
    } catch {
      toastError('Erro ao executar ação')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">
          Olá, {user?.nome?.split(' ')[0] ?? 'Prestador'}
        </h1>
        <p className="text-sm text-muted mt-1">Resumo de hoje.</p>
      </div>

      {/* Métricas */}
      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Pendentes</p>
            <p className="text-2xl font-semibold text-ink tabular-nums">{pendentes.length}</p>
            <p className="text-xs text-warning mt-1">aguardando confirmação</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Confirmados hoje</p>
            <p className="text-2xl font-semibold text-ink tabular-nums">{confirmadosHoje.length}</p>
            <p className="text-xs text-brand mt-1">agendados para hoje</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Concluídos</p>
            <p className="text-2xl font-semibold text-ink tabular-nums">{concluidos}</p>
            <p className="text-xs text-success mt-1">serviços realizados</p>
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/prestador/agendamentos"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border text-sm font-medium text-ink hover:bg-surface transition-colors duration-150"
        >
          <CalendarCheck size={14} strokeWidth={1.75} />
          Todos os agendamentos
        </Link>
        <Link
          href="/prestador/servicos"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border text-sm font-medium text-ink hover:bg-surface transition-colors duration-150"
        >
          <Scissors size={14} strokeWidth={1.75} />
          Gerenciar serviços
        </Link>
        <Link
          href="/prestador/disponibilidades"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border text-sm font-medium text-ink hover:bg-surface transition-colors duration-150"
        >
          <Clock size={14} strokeWidth={1.75} />
          Disponibilidades
        </Link>
      </div>

      {/* Agendamentos pendentes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink">Pendentes de confirmação</h2>
        {pendentes.length > 0 && (
          <span className="text-xs font-medium text-warning bg-warning-subtle border border-warning/20 px-2 py-0.5 rounded-sm">
            {pendentes.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <AppointmentCardSkeleton key={i} />)}
        </div>
      ) : pendentes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg">
          <EmptyState
            icon={TrendingUp}
            title="Tudo em dia"
            description="Nenhum agendamento aguardando confirmação."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {pendentes.map((ag) => (
            <AppointmentCard
              key={ag.id}
              agendamento={ag}
              viewAs="prestador"
              actions={
                <>
                  <button
                    onClick={() => doAction(ag.id, agendamentosApi.confirmar, 'Agendamento confirmado')}
                    disabled={actionLoading === ag.id}
                    className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98] disabled:opacity-40 inline-flex items-center gap-1.5"
                  >
                    {actionLoading === ag.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : null}
                    Confirmar
                  </button>
                  <button
                    onClick={() => doAction(ag.id, agendamentosApi.recusar, 'Agendamento recusado')}
                    disabled={actionLoading === ag.id}
                    className="h-9 px-4 rounded-md border border-border text-sm font-medium text-danger hover:bg-danger-subtle hover:border-danger/30 transition-colors duration-150 active:scale-[0.98] disabled:opacity-40"
                  >
                    Recusar
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="PRESTADOR">
      <DashboardContent />
    </AuthGuard>
  )
}
