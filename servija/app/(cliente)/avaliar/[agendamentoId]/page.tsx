'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { agendamentosApi, avaliacoesApi } from '@/lib/api'
import type { Agendamento } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/LoadingSkeleton'
import { PageWrapper } from '@/components/PageWrapper'
import { formatDate } from '@/lib/utils'

function AvaliarContent({ agendamentoId }: { agendamentoId: string }) {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const router = useRouter()

  const [agendamento, setAgendamento] = useState<Agendamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [nota, setNota] = useState(5)
  const [hoverNota, setHoverNota] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user?.clienteId) return
    agendamentosApi
      .getByCliente(user.clienteId)
      .then((ags) => setAgendamento(ags.find((a) => String(a.id) === String(agendamentoId)) ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [agendamentoId, user?.clienteId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agendamento || !user?.clienteId) return
    setSubmitting(true)
    try {
      await avaliacoesApi.create({
        clienteId: user.clienteId,
        prestadorId: agendamento.prestadorId,
        agendamentoId: agendamento.id,
        nota,
        comentario: comentario || undefined,
      })
      success('Avaliação enviada! Obrigado.')
      router.push('/cliente/agendamentos')
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper className="max-w-lg">
        <Skeleton className="h-48 w-full rounded-lg" />
      </PageWrapper>
    )
  }

  if (!agendamento) {
    return (
      <PageWrapper className="max-w-lg">
        <EmptyState icon={Star} title="Agendamento não encontrado" />
      </PageWrapper>
    )
  }

  const displayNota = hoverNota ?? nota

  return (
    <PageWrapper className="max-w-lg">
      <h1 className="text-2xl font-semibold text-ink tracking-tight mb-6">Avaliar serviço</h1>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm shadow-black/[0.03]">
        {/* Info do agendamento */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-ink">
            {agendamento.servicoNome ?? 'Serviço'}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {agendamento.prestadorNome ?? 'Prestador'}{agendamento.dataHoraInicio ? ` · ${formatDate(agendamento.dataHoraInicio)}` : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Estrelas */}
          <div>
            <label className="block text-xs font-medium text-ink mb-3">
              Sua nota
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNota(n)}
                  onMouseEnter={() => setHoverNota(n)}
                  onMouseLeave={() => setHoverNota(null)}
                  aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                  className="p-0.5 transition-transform duration-100 hover:scale-110 active:scale-95"
                >
                  <Star
                    size={28}
                    strokeWidth={1.5}
                    className={n <= displayNota ? 'fill-warning text-warning' : 'fill-border text-border'}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-ink tabular-nums">
                {displayNota}/5
              </span>
            </div>
          </div>

          {/* Comentário */}
          <div>
            <label htmlFor="comentario" className="block text-xs font-medium text-ink mb-1.5">
              Comentário <span className="text-subtle font-normal">(opcional)</span>
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Conte como foi a experiência…"
              className="textarea-field"
            />
          </div>

          <div className="flex gap-3 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-w-[160px] btn-primary"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Enviando…</>
                : 'Enviar avaliação'
              }
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}

export default function AvaliarPage({
  params,
}: {
  params: Promise<{ agendamentoId: string }>
}) {
  const { agendamentoId } = use(params)
  return (
    <AuthGuard requiredRole="CLIENTE">
      <AvaliarContent agendamentoId={agendamentoId} />
    </AuthGuard>
  )
}
