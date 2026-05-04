'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Check, Loader2, CreditCard, Coins, Banknote } from 'lucide-react'
import { prestadoresApi, servicosApi, agendamentosApi } from '@/lib/api'
import type { Prestador, Servico, Disponibilidade, PaymentMethod } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { ServiceCard } from '@/components/ServiceCard'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/LoadingSkeleton'
import { PageWrapper } from '@/components/PageWrapper'
import { formatCurrency, formatDuration, DIAS_SEMANA } from '@/lib/utils'

const PAGAMENTOS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'PIX', label: 'Pix', icon: Coins },
  { value: 'CARTAO', label: 'Cartão', icon: CreditCard },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
]

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Serviço', 'Data e hora', 'Confirmação']
  return (
    <div className="mb-8 space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-y-2 sm:justify-start">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1
          const done = step < current
          const active = step === current
          return (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 sm:h-7 sm:w-7
                  ${done ? 'bg-brand text-white shadow-md shadow-brand/25' : active ? 'bg-brand text-white shadow-md ring-4 ring-brand/20' : 'bg-border text-subtle'}`}
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : step}
              </div>
              {step < total && (
                <div
                  className={`mx-1 h-0.5 w-8 shrink-0 rounded-full sm:w-12 ${step < current ? 'bg-brand' : 'bg-border'}`}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-center text-xs leading-relaxed text-muted sm:text-left">
        <span className="font-semibold text-brand">Passo {current}</span>
        <span className="text-subtle"> de {total}</span>
        <span className="mx-2 text-border">·</span>
        <span className="text-ink">{labels[current - 1]}</span>
      </p>
    </div>
  )
}

function AgendarContent({ prestadorId }: { prestadorId: number }) {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [prestador, setPrestador] = useState<Prestador | null>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)
  const [dataHora, setDataHora] = useState('')
  const [pagamento, setPagamento] = useState<PaymentMethod>('PIX')
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    Promise.all([
      prestadoresApi.getById(prestadorId),
      servicosApi.getAtivosByPrestador(prestadorId),
      prestadoresApi.getDisponibilidades(prestadorId),
    ])
      .then(([p, s, d]) => {
        setPrestador(p)
        setServicos(s)
        setDisponibilidades(d)
      })
      .catch(() => toastError('Erro ao carregar dados do prestador'))
      .finally(() => setLoading(false))
  }, [prestadorId, toastError])

  const handleConfirmar = async () => {
    if (!user?.clienteId || !servicoSelecionado || !dataHora) return
    setSubmitting(true)
    try {
      await agendamentosApi.create({
        clienteId: user.clienteId,
        prestadorId,
        servicoId: servicoSelecionado.id,
        dataHora: new Date(dataHora).toISOString(),
        formaPagamento: pagamento,
        observacao: observacao || undefined,
      })
      success('Agendamento criado com sucesso!')
      router.push('/cliente/agendamentos')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar agendamento'
      toastError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const availableDays = new Set(disponibilidades.map((d) => d.diaSemana))

  if (loading) {
    return (
      <PageWrapper className="max-w-xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </PageWrapper>
    )
  }

  const inputCls = 'input-field'
  const btnBack = 'btn-secondary'
  const btnNext = 'btn-primary'

  return (
    <PageWrapper className="max-w-xl">
      <StepIndicator current={step} total={3} />

      <div className="card-surface p-6 sm:p-7">
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 className="text-sm font-semibold text-ink mb-4 tracking-tight">Escolha o serviço</h2>
            {servicos.length === 0 ? (
              <EmptyState icon={Coins} title="Nenhum serviço disponível" />
            ) : (
              <div className="space-y-3">
                {servicos.map((s) => (
                  <ServiceCard
                    key={s.id}
                    servico={s}
                    onSelect={setServicoSelecionado}
                    selected={servicoSelecionado?.id === s.id}
                  />
                ))}
              </div>
            )}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!servicoSelecionado}
                className={btnNext}
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 className="text-sm font-semibold text-ink mb-4">Escolha data e hora</h2>
            {disponibilidades.length > 0 && (
              <div className="mb-4 p-3.5 bg-surface border border-border rounded-lg">
                <p className="text-xs font-medium text-muted mb-2">Dias disponíveis</p>
                <div className="flex flex-wrap gap-1.5">
                  {DIAS_SEMANA.map((dia, i) =>
                    availableDays.has(i) ? (
                      <span key={i} className="text-xs bg-brand-subtle text-brand border border-brand/20 font-medium px-2 py-0.5 rounded-sm">
                        {dia}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="dataHora" className="block text-xs font-medium text-ink mb-1.5">
                Data e hora
              </label>
              <input
                id="dataHora"
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex gap-3 mt-6 flex-wrap">
              <button onClick={() => setStep(1)} type="button" className={btnBack}>Voltar</button>
              <button onClick={() => setStep(3)} disabled={!dataHora} type="button" className={btnNext}>
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && servicoSelecionado && (
          <div>
            <h2 className="text-sm font-semibold text-ink mb-4">Confirmar agendamento</h2>

            {/* Resumo */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-2 mb-5 shadow-inner shadow-black/2">
              {[
                ['Prestador', prestador?.nome],
                ['Serviço', servicoSelecionado.nome],
                ['Duração', formatDuration(servicoSelecionado.duracaoMinutos)],
                ['Data e hora', new Date(dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted">{k}</span>
                  <span className="font-medium text-ink">{v}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-xs font-semibold text-ink">Total</span>
                <span className="text-sm font-semibold text-ink tabular-nums">
                  {formatCurrency(servicoSelecionado.preco)}
                </span>
              </div>
            </div>

            {/* Pagamento */}
            <div className="mb-4">
              <p className="text-xs font-medium text-ink mb-2">Forma de pagamento</p>
              <div className="grid grid-cols-3 gap-2">
                {PAGAMENTOS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPagamento(value)}
                    className={`h-12 rounded-lg flex flex-col items-center justify-center gap-1 text-xs font-medium border transition-all duration-200
                      ${pagamento === value
                        ? 'border-brand bg-brand-subtle text-brand'
                        : 'border-border text-muted hover:border-border-strong hover:text-ink'
                      }`}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Observação */}
            <div className="mb-5">
              <label htmlFor="obs" className="block text-xs font-medium text-ink mb-1.5">
                Observação <span className="text-subtle font-normal">(opcional)</span>
              </label>
              <textarea
                id="obs"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                placeholder="Algum detalhe especial?"
                className="textarea-field"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={() => setStep(2)} className={btnBack}>Voltar</button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={submitting}
                className={`flex-1 min-w-[200px] ${btnNext}`}
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Confirmando…</>
                  : 'Confirmar agendamento'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

export default function AgendarPage({
  params,
}: {
  params: Promise<{ prestadorId: string }>
}) {
  const { prestadorId } = use(params)
  return (
    <AuthGuard requiredRole="CLIENTE">
      <AgendarContent prestadorId={Number(prestadorId)} />
    </AuthGuard>
  )
}
