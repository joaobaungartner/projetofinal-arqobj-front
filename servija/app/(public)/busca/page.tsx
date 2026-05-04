'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { prestadoresApi, categoriasApi, servicosApi } from '@/lib/api'
import type { Prestador, Categoria } from '@/lib/types'
import { ProviderCard } from '@/components/ProviderCard'
import { ProviderCardSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'

export default function BuscaPage() {
  const searchParams = useSearchParams()

  const [cidade, setCidade] = useState(searchParams.get('cidade') ?? '')
  const [bairro, setBairro] = useState(searchParams.get('bairro') ?? '')
  const [categoriaId, setCategoriaId] = useState(searchParams.get('categoria') ?? '')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [prestadores, setPrestadores] = useState<(Prestador & { menorPreco?: number })[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriasApi.getAtivas().then(setCategorias).catch(() => {})
  }, [])

  const handleSearch = useCallback(async () => {
    if (!cidade.trim()) {
      setError('Informe uma cidade para buscar.')
      return
    }
    setError('')
    setLoading(true)
    setSearched(true)
    try {
      let results: Prestador[]
      if (bairro.trim()) {
        results = await prestadoresApi.getByCidadeBairro(cidade.trim(), bairro.trim())
      } else {
        results = await prestadoresApi.getByCidade(cidade.trim())
      }

      const enriched = await Promise.all(
        results.map(async (p) => {
          try {
            const servicos = await servicosApi.getAtivosByPrestador(p.id)
            const menorPreco =
              servicos.length > 0 ? Math.min(...servicos.map((s) => s.preco)) : undefined
            return { ...p, menorPreco }
          } catch {
            return p
          }
        })
      )

      const filtered = categoriaId
        ? enriched.filter((p) => String(p.categoriaId) === String(categoriaId))
        : enriched

      setPrestadores(filtered)
    } catch {
      setError('Nenhum prestador encontrado para esta localidade.')
      setPrestadores([])
    } finally {
      setLoading(false)
    }
  }, [cidade, bairro, categoriaId])

  const handleClear = () => {
    setCidade('')
    setBairro('')
    setCategoriaId('')
    setPrestadores([])
    setSearched(false)
    setError('')
  }

  const hasFilters = cidade || bairro || categoriaId

  return (
    <PageWrapper>
      {/* Search card */}
      <div className="card-surface p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle text-brand">
            <SlidersHorizontal size={16} strokeWidth={1.75} />
          </div>
          <h1 className="text-base font-semibold text-ink tracking-tight">Buscar prestadores</h1>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
          <div>
            <label htmlFor="cidade" className="block text-xs font-medium text-ink mb-1.5">
              Cidade <span className="text-danger">*</span>
            </label>
            <input
              id="cidade"
              type="text"
              placeholder="Ex: São Paulo"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="bairro" className="block text-xs font-medium text-ink mb-1.5">
              Bairro <span className="text-subtle text-xs font-normal">(opcional)</span>
            </label>
            <input
              id="bairro"
              type="text"
              placeholder="Ex: Pinheiros"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="categoria" className="block text-xs font-medium text-ink mb-1.5">
              Categoria
            </label>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs text-danger mb-3 font-medium">{error}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary"
          >
            <Search size={15} />
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="btn-secondary-sm"
            >
              <X size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProviderCardSkeleton key={i} />)}
        </div>
      ) : searched && prestadores.length === 0 ? (
        <div className="card-surface overflow-hidden">
          <EmptyState
            icon={Search}
            title="Nenhum prestador encontrado"
            description="Tente outra cidade, bairro ou remova o filtro de categoria."
            action={
              <button
                onClick={handleClear}
                className="btn-secondary-sm"
              >
                Limpar filtros
              </button>
            }
          />
        </div>
      ) : prestadores.length > 0 ? (
        <>
          <p className="text-xs text-muted mb-4">
            {prestadores.length} prestador{prestadores.length !== 1 ? 'es' : ''} encontrado{prestadores.length !== 1 ? 's' : ''}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prestadores.map((p) => <ProviderCard key={p.id} prestador={p} />)}
          </div>
        </>
      ) : (
        <div className="card-surface overflow-hidden">
          <EmptyState
            icon={Search}
            title="Busque por prestadores"
            description="Informe uma cidade para encontrar profissionais disponíveis."
          />
        </div>
      )}
    </PageWrapper>
  )
}
