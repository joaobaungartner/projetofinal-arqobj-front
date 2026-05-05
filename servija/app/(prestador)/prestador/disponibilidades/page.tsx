'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Clock, Loader2 } from 'lucide-react'
import { prestadoresApi, disponibilidadesApi } from '@/lib/api'
import type { Disponibilidade } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { EmptyState } from '@/components/EmptyState'
import { PageWrapper } from '@/components/PageWrapper'
import { SimpleModal } from '@/components/SimpleModal'
import { Skeleton } from '@/components/LoadingSkeleton'
import { DIAS_SEMANA, DIAS_SEMANA_LIST } from '@/lib/utils'

interface FormData { diaSemana: string; horaInicio: string; horaFim: string }
const emptyForm: FormData = { diaSemana: '1', horaInicio: '08:00', horaFim: '17:00' }

function DisponibilidadesContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Disponibilidade | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

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
      const data = {
        diaSemana: parseInt(form.diaSemana),
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        ativa: true,
      }
      if (editing) {
        await disponibilidadesApi.update(user.prestadorId, editing.id, data)
        success('Atualizado')
      } else {
        await disponibilidadesApi.create(user.prestadorId, data)
        success('Criado')
      }
      setShowForm(false)
      load()
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleRemover = async (id: string) => {
    if (!user?.prestadorId) return
    setRemoving(id)
    try {
      await disponibilidadesApi.delete(user.prestadorId, id)
      success('Removido')
      setDisponibilidades((prev) => prev.filter((d) => d.id !== id))
    } catch {
      toastError('Erro ao remover')
    } finally {
      setRemoving(null)
    }
  }

  // Agrupar por dia da semana (valores ISO 1-7)
  const byDay = DIAS_SEMANA_LIST.map(({ value, label }) => ({
    value,
    label,
    items: disponibilidades.filter((d) => d.diaSemana === value),
  })).filter((d) => d.items.length > 0)

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Disponibilidade</h1>
        <button
          onClick={openCreate}
          className="btn-primary-sm gap-1.5"
        >
          <Plus size={15} />
          Adicionar horário
        </button>
      </div>

      {showForm && (
        <SimpleModal
          narrow
          title={editing ? 'Editar disponibilidade' : 'Novo horário'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="dia" className="block text-xs font-medium text-ink mb-1.5">Dia da semana</label>
              <select id="dia" value={form.diaSemana} onChange={(e) => setForm((p) => ({ ...p, diaSemana: e.target.value }))} className="input-field">
                {DIAS_SEMANA_LIST.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inicio" className="block text-xs font-medium text-ink mb-1.5">Início</label>
                <input id="inicio" type="time" value={form.horaInicio} onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label htmlFor="fim" className="block text-xs font-medium text-ink mb-1.5">Fim</label>
                <input id="fim" type="time" value={form.horaFim} onChange={(e) => setForm((p) => ({ ...p, horaFim: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 pt-1 flex-wrap">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 min-w-[120px] btn-primary">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando…</> : 'Salvar'}
              </button>
            </div>
          </form>
        </SimpleModal>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : disponibilidades.length === 0 ? (
        <div className="card-surface overflow-hidden">
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
            <div key={day.value} className="card-surface p-4 sm:p-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{day.label}</p>
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
                        className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors duration-200 hover:bg-surface hover:text-ink"
                      >
                        <Pencil size={12} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleRemover(item.id)}
                        disabled={removing === item.id}
                        aria-label="Remover horário"
                        className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors duration-200 hover:border-danger/35 hover:bg-danger-subtle hover:text-danger disabled:opacity-40"
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
