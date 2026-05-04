'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Scissors, Loader2 } from 'lucide-react'
import { servicosApi } from '@/lib/api'
import type { Servico, CreateServicoDto } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'
import { SimpleModal } from '@/components/SimpleModal'
import { Skeleton } from '@/components/LoadingSkeleton'
import { formatCurrency, formatDuration } from '@/lib/utils'

interface FormData {
  nome: string
  descricao: string
  preco: string
  duracaoMinutos: string
}

const emptyForm: FormData = { nome: '', descricao: '', preco: '', duracaoMinutos: '' }

function ServicosContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!user?.prestadorId) return
    setLoading(true)
    try {
      setServicos(await servicosApi.getByPrestador(user.prestadorId))
    } catch {
      toastError('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [user?.prestadorId, toastError])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (s: Servico) => {
    setEditing(s)
    setForm({ nome: s.nome, descricao: s.descricao ?? '', preco: String(s.preco), duracaoMinutos: String(s.duracaoMinutos) })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.prestadorId) return
    setSaving(true)
    try {
      const data: CreateServicoDto = {
        prestadorId: user.prestadorId,
        nome: form.nome,
        descricao: form.descricao || undefined,
        preco: parseFloat(form.preco),
        duracaoMinutos: parseInt(form.duracaoMinutos),
      }
      if (editing) {
        await servicosApi.update(editing.id, data)
        success('Serviço atualizado')
      } else {
        await servicosApi.create(data)
        success('Serviço criado')
      }
      setShowForm(false)
      load()
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const toggleAtivo = async (s: Servico) => {
    setActionLoading(s.id)
    try {
      if (s.ativo) { await servicosApi.desativar(s.id); success('Desativado') }
      else { await servicosApi.ativar(s.id); success('Ativado') }
      load()
    } catch {
      toastError('Erro ao atualizar status')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Meus serviços</h1>
        <button
          onClick={openCreate}
          className="btn-primary-sm gap-1.5"
        >
          <Plus size={15} />
          Novo serviço
        </button>
      </div>

      {showForm && (
        <SimpleModal title={editing ? 'Editar serviço' : 'Novo serviço'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="svc-nome" className="block text-xs font-medium text-ink mb-1.5">Nome *</label>
              <input id="svc-nome" type="text" required value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label htmlFor="svc-desc" className="block text-xs font-medium text-ink mb-1.5">Descrição <span className="text-subtle font-normal">(opcional)</span></label>
              <textarea id="svc-desc" rows={2} value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} className="textarea-field min-h-[4.5rem]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="svc-preco" className="block text-xs font-medium text-ink mb-1.5">Preço (R$) *</label>
                <input id="svc-preco" type="number" step="0.01" min="0" required value={form.preco} onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label htmlFor="svc-dur" className="block text-xs font-medium text-ink mb-1.5">Duração (min) *</label>
                <input id="svc-dur" type="number" min="1" required value={form.duracaoMinutos} onChange={(e) => setForm((p) => ({ ...p, duracaoMinutos: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 pt-1 flex-wrap">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 min-w-[140px] btn-primary">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando…</> : 'Salvar'}
              </button>
            </div>
          </form>
        </SimpleModal>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : servicos.length === 0 ? (
        <div className="card-surface overflow-hidden">
          <EmptyState
            icon={Scissors}
            title="Nenhum serviço cadastrado"
            description="Adicione os serviços que você oferece para que clientes possam te encontrar."
            action={
              <button onClick={openCreate} className="btn-primary-sm">
                Criar primeiro serviço
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {servicos.map((s) => (
            <div key={s.id} className={`card-surface p-4 flex items-center gap-4 transition-opacity ${!s.ativo ? 'opacity-55' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-ink">{s.nome}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm font-medium ${s.ativo ? 'bg-success-subtle text-success' : 'bg-surface text-subtle border border-border'}`}>
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {s.descricao && (
                  <p className="text-xs text-muted mt-0.5 truncate">{s.descricao}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                  <span className="font-medium text-ink tabular-nums">{formatCurrency(s.preco)}</span>
                  <span>·</span>
                  <span>{formatDuration(s.duracaoMinutos)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(s)}
                  aria-label="Editar serviço"
                  className="h-8 w-8 rounded-md border border-border text-muted hover:text-ink hover:bg-surface transition-colors duration-150 flex items-center justify-center"
                >
                  <Pencil size={13} strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => toggleAtivo(s)}
                  disabled={actionLoading === s.id}
                  className={`h-8 px-3 rounded-md border text-xs font-medium transition-colors duration-150 disabled:opacity-40 inline-flex items-center gap-1
                    ${s.ativo
                      ? 'border-border text-muted hover:text-warning hover:border-warning/30 hover:bg-warning-subtle'
                      : 'border-border text-muted hover:text-success hover:border-success/30 hover:bg-success-subtle'
                    }`}
                >
                  {actionLoading === s.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : s.ativo ? 'Desativar' : 'Ativar'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

export default function ServicosPage() {
  return (
    <AuthGuard requiredRole="PRESTADOR">
      <ServicosContent />
    </AuthGuard>
  )
}
