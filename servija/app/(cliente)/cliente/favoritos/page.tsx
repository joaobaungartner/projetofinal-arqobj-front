'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Heart, Trash2, MapPin } from 'lucide-react'
import { favoritosApi } from '@/lib/api'
import type { Favorito } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'
import { Skeleton } from '@/components/LoadingSkeleton'
import { getInitials } from '@/lib/utils'

function FavoritosContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!user?.clienteId) return
    setLoading(true)
    try {
      const all = await favoritosApi.getAll()
      setFavoritos(all.filter((f) => f.clienteId === user.clienteId))
    } catch {
      toastError('Erro ao carregar favoritos')
    } finally {
      setLoading(false)
    }
  }, [user?.clienteId, toastError])

  useEffect(() => { load() }, [load])

  const handleRemover = async (id: number) => {
    setRemoving(id)
    try {
      await favoritosApi.delete(id)
      success('Removido dos favoritos')
      setFavoritos((prev) => prev.filter((f) => f.id !== id))
    } catch {
      toastError('Erro ao remover')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-semibold text-ink tracking-tight mb-6">Favoritos</h1>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : favoritos.length === 0 ? (
        <div className="bg-card border border-border rounded-lg">
          <EmptyState
            icon={Heart}
            title="Nenhum favorito ainda"
            description="Salve prestadores que você gostou para encontrá-los facilmente."
            action={
              <Link
                href="/busca"
                className="h-9 px-4 rounded-md border border-border-strong text-sm font-medium text-ink hover:bg-surface transition-colors duration-150 inline-block leading-9"
              >
                Buscar prestadores
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoritos.map((fav) => (
            <div key={fav.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {getInitials(fav.prestadorNome ?? '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {fav.prestadorNome ?? 'Prestador'}
                  </p>
                  {fav.prestadorCidade && (
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                      <MapPin size={11} strokeWidth={1.75} />
                      {fav.prestadorCidade}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-border">
                <Link
                  href={`/prestadores/${fav.prestadorId}`}
                  className="flex-1 h-9 rounded-md bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors duration-150 flex items-center justify-center"
                >
                  Ver perfil
                </Link>
                <button
                  onClick={() => handleRemover(fav.id)}
                  disabled={removing === fav.id}
                  aria-label="Remover dos favoritos"
                  className="h-9 w-9 rounded-md border border-border text-muted hover:text-danger hover:border-danger/30 hover:bg-danger-subtle transition-colors duration-150 disabled:opacity-40 flex items-center justify-center"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

export default function FavoritosPage() {
  return (
    <AuthGuard requiredRole="CLIENTE">
      <FavoritosContent />
    </AuthGuard>
  )
}
