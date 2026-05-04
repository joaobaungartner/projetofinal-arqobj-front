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
  const inputCls =
    'h-10 w-full px-3 rounded-md border border-border bg-card text-sm text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors duration-150'

  return (
    <PageWrapper>
      {/* Search card */}
      <div className="bg-card border border-border rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={16} strokeWidth={1.75} className="text-muted" />
          <h1 className="text-sm font-semibold text-ink">Buscar prestadores</h1>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-3">
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
              className={inputCls}
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
              className={inputCls}
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
              className={inputCls}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs text-danger mb-3">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="h-10 px-5 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Search size={15} />
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="h-10 px-3 rounded-md border border-border text-sm text-muted hover:text-ink hover:bg-surface transition-colors duration-150 inline-flex items-center gap-1"
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
        <div className="bg-card border border-border rounded-lg">
          <EmptyState
            icon={Search}
            title="Nenhum prestador encontrado"
            description="Tente outra cidade, bairro ou remova o filtro de categoria."
            action={
              <button
                onClick={handleClear}
                className="h-9 px-4 rounded-md border border-border-strong text-sm font-medium text-ink hover:bg-surface transition-colors duration-150"
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
        <div className="bg-card border border-border rounded-lg">
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
