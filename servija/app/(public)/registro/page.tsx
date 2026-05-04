'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { clientesApi, prestadoresApi, categoriasApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { Categoria } from '@/lib/types'

type Tipo = 'CLIENTE' | 'PRESTADOR'

export default function RegistroPage() {
  const searchParams = useSearchParams()
  const defaultTipo = (searchParams.get('tipo')?.toUpperCase() as Tipo) ?? 'CLIENTE'

  const { isAuthenticated } = useAuth()
  const { success, error: toastError } = useToast()
  const router = useRouter()

  const [tipo, setTipo] = useState<Tipo>(defaultTipo)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmarSenha: '',
    telefone: '', cidade: '', bairro: '', descricao: '', categoriaId: '',
  })

  useEffect(() => {
    if (isAuthenticated) router.replace('/')
  }, [isAuthenticated, router])

  useEffect(() => {
    categoriasApi.getAtivas().then(setCategorias).catch(() => {})
  }, [])

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (form.senha !== form.confirmarSenha) {
      setFormError('As senhas não coincidem.')
      return
    }
    if (!form.nome || !form.email || !form.senha || !form.cidade) {
      setFormError('Preencha os campos obrigatórios.')
      return
    }
    setLoading(true)
    try {
      if (tipo === 'CLIENTE') {
        await clientesApi.create({
          nome: form.nome, email: form.email, senha: form.senha,
          telefone: form.telefone || undefined,
          cidade: form.cidade, bairro: form.bairro || undefined,
        })
      } else {
        await prestadoresApi.create({
          nome: form.nome, email: form.email, senha: form.senha,
          telefone: form.telefone || undefined,
          cidade: form.cidade, bairro: form.bairro || undefined,
          descricao: form.descricao || undefined,
          categoriaId: form.categoriaId ? Number(form.categoriaId) : undefined,
        })
      }
      success('Conta criada! Faça login para continuar.')
      router.push('/login')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta'
      setFormError(msg)
      toastError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'h-10 w-full px-3 rounded-md border border-border bg-card text-sm text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors duration-150'

  const Label = ({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) => (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-ink mb-1.5">
      {children}
      {optional && <span className="text-subtle font-normal ml-1">(opcional)</span>}
    </label>
  )

  return (
    <div className="min-h-[calc(100vh-56px)] bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-base font-semibold text-ink">
            Servi<span className="text-brand">Já</span>
          </Link>
          <h1 className="text-xl font-semibold text-ink mt-5 mb-1.5">Criar conta</h1>
          <p className="text-sm text-muted">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {/* Tipo switcher */}
          <div className="flex bg-surface rounded-md p-0.5 mb-5 border border-border">
            {(['CLIENTE', 'PRESTADOR'] as Tipo[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`flex-1 h-8 rounded text-xs font-medium transition-all duration-150
                  ${tipo === t ? 'bg-card text-ink shadow-sm border border-border' : 'text-muted'}`}
              >
                {t === 'CLIENTE' ? 'Sou cliente' : 'Sou prestador'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <input id="nome" type="text" value={form.nome} onChange={set('nome')} placeholder="Seu nome" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="reg-email">E-mail</Label>
                <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" className={inputCls} />
              </div>
              <div>
                <Label htmlFor="reg-senha">Senha</Label>
                <input id="reg-senha" type="password" autoComplete="new-password" value={form.senha} onChange={set('senha')} placeholder="Mín. 8 caracteres" className={inputCls} />
              </div>
              <div>
                <Label htmlFor="confirmar">Confirmar senha</Label>
                <input id="confirmar" type="password" autoComplete="new-password" value={form.confirmarSenha} onChange={set('confirmarSenha')} placeholder="Repita a senha" className={inputCls} />
              </div>
              <div>
                <Label htmlFor="telefone" optional>Telefone</Label>
                <input id="telefone" type="tel" value={form.telefone} onChange={set('telefone')} placeholder="(11) 99999-9999" className={inputCls} />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <input id="cidade" type="text" value={form.cidade} onChange={set('cidade')} placeholder="Sua cidade" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bairro" optional>Bairro</Label>
                <input id="bairro" type="text" value={form.bairro} onChange={set('bairro')} placeholder="Seu bairro" className={inputCls} />
              </div>

              {tipo === 'PRESTADOR' && (
                <>
                  <div className="sm:col-span-2">
                    <Label htmlFor="categoria" optional>Categoria</Label>
                    <select id="categoria" value={form.categoriaId} onChange={set('categoriaId')} className={inputCls}>
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="descricao" optional>Descrição do negócio</Label>
                    <textarea
                      id="descricao"
                      value={form.descricao}
                      onChange={set('descricao')}
                      rows={3}
                      placeholder="Descreva seus serviços…"
                      className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors duration-150 resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {formError && (
              <p className="text-xs text-danger bg-danger-subtle border border-danger/20 px-3 py-2 rounded-md">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Criando conta…</>
                : 'Criar conta'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
