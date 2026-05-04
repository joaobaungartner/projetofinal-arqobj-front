'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { MapPin, Heart, Calendar, MessageSquare, Loader2 } from 'lucide-react'
import {
  prestadoresApi,
  servicosApi,
  avaliacoesApi,
  favoritosApi,
} from '@/lib/api'
import type { Prestador, Servico, Avaliacao, Favorito } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { StarRating } from '@/components/StarRating'
import { ServiceCard } from '@/components/ServiceCard'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/LoadingSkeleton'
import { getInitials, formatDate } from '@/lib/utils'

type Tab = 'servicos' | 'avaliacoes'

export default function PerfilPrestadorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const prestadorId = Number(id)

  const { isAuthenticated, role, user } = useAuth()
  const { success, error: toastError } = useToast()
  const router = useRouter()

  const [prestador, setPrestador] = useState<Prestador | null>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [favorito, setFavorito] = useState<Favorito | null>(null)
  const [loading, setLoading] = useState(true)
  const [favLoading, setFavLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('servicos')

  useEffect(() => {
    Promise.all([
      prestadoresApi.getById(prestadorId),
      servicosApi.getAtivosByPrestador(prestadorId),
      avaliacoesApi.getAll(),
    ])
      .then(([p, s, avs]) => {
        setPrestador(p)
        setServicos(s)
        setAvaliacoes(avs.filter((a) => a.prestadorId === prestadorId))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [prestadorId])

  useEffect(() => {
    if (!isAuthenticated || role !== 'CLIENTE') return
    favoritosApi
      .getAll()
      .then((favs) => {
        const fav = favs.find(
          (f) => f.prestadorId === prestadorId && f.clienteId === user?.clienteId
        )
        setFavorito(fav ?? null)
      })
      .catch(() => {})
  }, [isAuthenticated, role, prestadorId, user?.clienteId])

  const toggleFavorito = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/prestadores/${prestadorId}`)
      return
    }
    if (role !== 'CLIENTE') return
    setFavLoading(true)
    try {
      if (favorito) {
        await favoritosApi.delete(favorito.id)
        setFavorito(null)
        success('Removido dos favoritos')
      } else {
        await favoritosApi.create(user!.clienteId!, prestadorId)
        const favs = await favoritosApi.getAll()
        const fav = favs.find(
          (f) => f.prestadorId === prestadorId && f.clienteId === user?.clienteId
        )
        setFavorito(fav ?? null)
        success('Adicionado aos favoritos')
      }
    } catch {
      toastError('Erro ao atualizar favorito')
    } finally {
      setFavLoading(false)
    }
  }

  const handleAgendar = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/agendar/${prestadorId}`)
    } else if (role !== 'CLIENTE') {
      toastError('Apenas clientes podem agendar')
    } else {
      router.push(`/agendar/${prestadorId}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!prestador) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
        <EmptyState icon={MapPin} title="Prestador não encontrado" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b border-border px-4 md:px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div
              className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white text-lg font-semibold shrink-0"
              aria-label={`Avatar de ${prestador.nome}`}
            >
              {getInitials(prestador.nome)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-ink">{prestador.nome}</h1>
              {prestador.categoriaNome && (
                <span className="inline-flex items-center mt-1 text-xs text-muted bg-surface border border-border px-2 py-0.5 rounded-sm">
                  {prestador.categoriaNome}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {(prestador.notaMedia ?? 0) > 0 && (
                  <StarRating rating={prestador.notaMedia!} size="sm" />
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <MapPin size={12} strokeWidth={1.75} />
                  {prestador.cidade}{prestador.bairro ? `, ${prestador.bairro}` : ''}
                </span>
              </div>
              {prestador.descricao && (
                <p className="mt-2 text-sm text-muted leading-relaxed max-w-xl">
                  {prestador.descricao}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleAgendar}
                className="h-10 px-5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98] inline-flex items-center gap-2"
              >
                <Calendar size={15} />
                Agendar
              </button>
              {role === 'CLIENTE' && (
                <button
                  onClick={toggleFavorito}
                  disabled={favLoading}
                  aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  className={`h-10 w-10 rounded-md border flex items-center justify-center transition-colors duration-150 active:scale-[0.98] disabled:opacity-40
                    ${favorito
                      ? 'border-danger/30 bg-danger-subtle text-danger'
                      : 'border-border text-muted hover:text-danger hover:border-danger/30 hover:bg-danger-subtle'
                    }`}
                >
                  {favLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Heart size={16} strokeWidth={1.75} fill={favorito ? 'currentColor' : 'none'} />
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border px-4 md:px-6">
        <div className="max-w-screen-xl mx-auto flex gap-1">
          {([
            { key: 'servicos', label: `Serviços (${servicos.length})` },
            { key: 'avaliacoes', label: `Avaliações (${avaliacoes.length})` },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`h-11 px-4 text-sm font-medium border-b-2 transition-colors duration-150
                ${tab === t.key
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-ink'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 max-w-2xl">
        {tab === 'servicos' && (
          servicos.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum serviço disponível"
              description="Este prestador ainda não cadastrou serviços."
            />
          ) : (
            <div className="space-y-3">
              {servicos.map((s) => (
                <ServiceCard key={s.id} servico={s} />
              ))}
            </div>
          )
        )}

        {tab === 'avaliacoes' && (
          avaliacoes.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Sem avaliações ainda"
              description="Este prestador ainda não recebeu avaliações."
            />
          ) : (
            <div className="space-y-3">
              {avaliacoes.slice(0, 10).map((av) => (
                <div key={av.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-medium text-muted">
                        {getInitials(av.clienteNome ?? 'C')}
                      </div>
                      <span className="text-sm font-medium text-ink">
                        {av.clienteNome ?? 'Cliente'}
                      </span>
                    </div>
                    <StarRating rating={av.nota} size="sm" showValue={false} />
                  </div>
                  {av.comentario && (
                    <p className="text-xs text-muted leading-relaxed">{av.comentario}</p>
                  )}
                  {av.dataCriacao && (
                    <p className="text-xs text-subtle mt-2">{formatDate(av.dataCriacao)}</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
