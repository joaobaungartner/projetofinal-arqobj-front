'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Clock, X, Loader2 } from 'lucide-react'
import { prestadoresApi, disponibilidadesApi } from '@/lib/api'
import type { Disponibilidade } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'
import { Skeleton } from '@/components/LoadingSkeleton'
import { DIAS_SEMANA } from '@/lib/utils'

interface FormData { diaSemana: string; horaInicio: string; horaFim: string }
const emptyForm: FormData = { diaSemana: '1', horaInicio: '08:00', horaFim: '17:00' }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-sm shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function DisponibilidadesContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Disponibilidade | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!user?.prestadorId) return
    setLoading(true)
    try {
      setDisponibilidades(await prestadoresApi.getDisponibilidades(user.prestadorId))
    } catch {
      toastError('Erro ao carregar disponibilidades')
    } finally {
      setLoading(false)
    }
  }, [user?.prestadorId, toastError])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (d: Disponibilidade) => {
    setEditing(d)
    setForm({ diaSemana: String(d.diaSemana), horaInicio: d.horaInicio, horaFim: d.horaFim })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.prestadorId) return
    setSaving(true)
    try {
      const data = { prestadorId: user.prestadorId, diaSemana: parseInt(form.diaSemana), horaInicio: form.horaInicio, horaFim: form.horaFim }
      if (editing) { await disponibilidadesApi.update(editing.id, data); success('Atualizado') }
      else { await disponibilidadesApi.create(data); success('Criado') }
      setShowForm(false)
      load()
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleRemover = async (id: number) => {
    setRemoving(id)
    try {
      await disponibilidadesApi.delete(id)
      success('Removido')
      setDisponibilidades((prev) => prev.filter((d) => d.id !== id))
    } catch {
      toastError('Erro ao remover')
    } finally {
      setRemoving(null)
    }
  }

  const byDay = DIAS_SEMANA.map((nome, i) => ({
    nome, index: i,
    items: disponibilidades.filter((d) => d.diaSemana === i),
  })).filter((d) => d.items.length > 0)

  const inputCls = 'h-10 w-full px-3 rounded-md border border-border bg-card text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors duration-150'

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Disponibilidade</h1>
        <button
          onClick={openCreate}
          className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98] inline-flex items-center gap-1.5"
        >
          <Plus size={15} />
          Adicionar horário
        </button>
      </div>

      {showForm && (
        <Modal title={editing ? 'Editar disponibilidade' : 'Novo horário'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="dia" className="block text-xs font-medium text-ink mb-1.5">Dia da semana</label>
              <select id="dia" value={form.diaSemana} onChange={(e) => setForm((p) => ({ ...p, diaSemana: e.target.value }))} className={inputCls}>
                {DIAS_SEMANA.map((dia, i) => <option key={i} value={i}>{dia}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inicio" className="block text-xs font-medium text-ink mb-1.5">Início</label>
                <input id="inicio" type="time" value={form.horaInicio} onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label htmlFor="fim" className="block text-xs font-medium text-ink mb-1.5">Fim</label>
                <input id="fim" type="time" value={form.horaFim} onChange={(e) => setForm((p) => ({ ...p, horaFim: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="h-10 px-4 rounded-md border border-border text-sm font-medium text-ink hover:bg-surface transition-colors duration-150">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 h-10 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando…</> : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : disponibilidades.length === 0 ? (
        <div className="bg-card border border-border rounded-lg">
          <EmptyState
            icon={Clock}
            title="Nenhum horário cadastrado"
            description="Adicione seus horários de atendimento para que os clientes possam agendar."
            action={
              <button onClick={openCreate} className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98]">
                Adicionar horário
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {byDay.map((day) => (
            <div key={day.index} className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{day.nome}</p>
              <div className="space-y-2">
                {day.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-ink tabular-nums">
                      {item.horaInicio} – {item.horaFim}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(item)}
                        aria-label="Editar horário"
                        className="h-7 w-7 rounded-md border border-border text-muted hover:text-ink hover:bg-surface transition-colors duration-150 flex items-center justify-center"
                      >
                        <Pencil size={12} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleRemover(item.id)}
                        disabled={removing === item.id}
                        aria-label="Remover horário"
                        className="h-7 w-7 rounded-md border border-border text-muted hover:text-danger hover:border-danger/30 hover:bg-danger-subtle transition-colors duration-150 disabled:opacity-40 flex items-center justify-center"
                      >
                        {removing === item.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Trash2 size={12} strokeWidth={1.75} />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

export default function DisponibilidadesPage() {
  return (
    <AuthGuard requiredRole="PRESTADOR">
      <DisponibilidadesContent />
    </AuthGuard>
  )
}
