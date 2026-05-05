'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, UserCircle, Save, MapPin } from 'lucide-react'
import { prestadoresApi } from '@/lib/api'
import type { Prestador } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { PageWrapper } from '@/components/PageWrapper'

interface FormData {
  nome: string
  email: string
  telefone: string
  descricao: string
  senha: string
  confirmarSenha: string
}

function PerfilContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [prestador, setPrestador] = useState<Prestador | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
    senha: '',
    confirmarSenha: '',
  })

  const load = useCallback(async () => {
    if (!user?.prestadorId) return
    setLoading(true)
    try {
      const data = await prestadoresApi.getById(user.prestadorId)
      setPrestador(data)
      setForm({
        nome: data.nome ?? '',
        email: data.email ?? '',
        telefone: data.telefone ?? '',
        descricao: data.descricao ?? '',
        senha: '',
        confirmarSenha: '',
      })
    } catch {
      toastError('Erro ao carregar dados do perfil')
    } finally {
      setLoading(false)
    }
  }, [user?.prestadorId, toastError])

  useEffect(() => { load() }, [load])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.prestadorId || !prestador) return

    if (form.senha && form.senha !== form.confirmarSenha) {
      toastError('As senhas não coincidem')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || null,
        descricao: form.descricao || null,
        enderecoId: prestador.endereco?.id ?? null,
      }
      if (form.senha) payload.senha = form.senha

      await prestadoresApi.update(user.prestadorId, payload)
      success('Perfil atualizado com sucesso!')
      setForm((prev) => ({ ...prev, senha: '', confirmarSenha: '' }))
    } catch {
      toastError('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-muted" />
        </div>
      </PageWrapper>
    )
  }

  if (!prestador) {
    return (
      <PageWrapper>
        <p className="text-sm text-muted">Não foi possível carregar o perfil.</p>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-brand-subtle flex items-center justify-center">
          <UserCircle size={22} className="text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Meu perfil</h1>
          <p className="text-sm text-muted">Gerencie seus dados de prestador.</p>
        </div>
      </div>

      <div className="max-w-lg space-y-4">
        <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Dados profissionais</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Nome completo</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Telefone</label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Descrição</label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="textarea-field"
                  placeholder="Fale sobre você e seus serviços..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Alterar senha</p>
            <p className="text-xs text-subtle mb-3">Deixe em branco para manter a senha atual.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Nova senha</label>
                <input
                  name="senha"
                  type="password"
                  value={form.senha}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nova senha"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Confirmar nova senha</label>
                <input
                  name="confirmarSenha"
                  type="password"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Confirme a nova senha"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>

        {prestador.endereco && (
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-muted shrink-0" />
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Endereço cadastrado</p>
            </div>
            <p className="text-sm text-ink">
              {prestador.endereco.rua}, {prestador.endereco.numero}
              {prestador.endereco.complemento ? ` — ${prestador.endereco.complemento}` : ''}
            </p>
            <p className="text-sm text-muted mt-0.5">
              {prestador.endereco.bairro} · {prestador.endereco.cidade}/{prestador.endereco.estado}
              {prestador.endereco.cep ? ` · CEP ${prestador.endereco.cep}` : ''}
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

export default function PerfilPage() {
  return (
    <AuthGuard requiredRole="PRESTADOR">
      <PerfilContent />
    </AuthGuard>
  )
}
