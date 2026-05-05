'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, UserCircle, Save } from 'lucide-react'
import { clientesApi } from '@/lib/api'
import type { Cliente } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AuthGuard } from '@/components/AuthGuard'
import { PageWrapper } from '@/components/PageWrapper'

interface FormData {
  nome: string
  email: string
  telefone: string
  cpf: string
  senha: string
  confirmarSenha: string
}

function PerfilContent() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    senha: '',
    confirmarSenha: '',
  })

  const load = useCallback(async () => {
    if (!user?.clienteId) return
    setLoading(true)
    try {
      const data = await clientesApi.getById(user.clienteId)
      setCliente(data)
      setForm({
        nome: data.nome ?? '',
        email: data.email ?? '',
        telefone: data.telefone ?? '',
        cpf: data.cpf ?? '',
        senha: '',
        confirmarSenha: '',
      })
    } catch {
      toastError('Erro ao carregar dados do perfil')
    } finally {
      setLoading(false)
    }
  }, [user?.clienteId, toastError])

  useEffect(() => { load() }, [load])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.clienteId) return

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
        cpf: form.cpf || null,
      }
      if (form.senha) payload.senha = form.senha

      await clientesApi.update(user.clienteId, payload)
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

  if (!cliente) {
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
          <p className="text-sm text-muted">Gerencie seus dados pessoais.</p>
        </div>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Dados pessoais</p>
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
                <label className="block text-sm font-medium text-ink mb-1.5">CPF</label>
                <input
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="000.000.000-00"
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
      </div>
    </PageWrapper>
  )
}

export default function PerfilPage() {
  return (
    <AuthGuard requiredRole="CLIENTE">
      <PerfilContent />
    </AuthGuard>
  )
}
