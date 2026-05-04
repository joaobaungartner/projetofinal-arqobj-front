'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { UserRole } from '@/lib/types'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const { login, isAuthenticated } = useAuth()
  const { success, error: toastError } = useToast()
  const router = useRouter()

  const [tipo, setTipo] = useState<UserRole>('CLIENTE')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isAuthenticated) router.replace(redirect)
  }, [isAuthenticated, redirect, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!email || !senha) {
      setFormError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    try {
      await login(email, senha, tipo)
      success('Bem-vindo de volta!')
      router.push(redirect)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'E-mail ou senha incorretos'
      setFormError(msg)
      toastError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'h-10 w-full px-3 rounded-md border border-border bg-card text-sm text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand transition-colors duration-150'

  return (
    <div className="min-h-[calc(100vh-56px)] bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-base font-semibold text-ink">
            Servi<span className="text-brand">Já</span>
          </Link>
          <h1 className="text-xl font-semibold text-ink mt-5 mb-1.5">
            Entrar na conta
          </h1>
          <p className="text-sm text-muted">
            Não tem conta?{' '}
            <Link href="/registro" className="text-brand font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {/* Tipo switcher */}
          <div className="flex bg-surface rounded-md p-0.5 mb-5 border border-border">
            {(['CLIENTE', 'PRESTADOR'] as UserRole[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`flex-1 h-8 rounded text-xs font-medium transition-all duration-150
                  ${tipo === t ? 'bg-card text-ink shadow-sm border border-border' : 'text-muted'}`}
              >
                {t === 'CLIENTE' ? 'Cliente' : 'Prestador'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-xs font-medium text-ink mb-1.5">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
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
              {loading ? <><Loader2 size={15} className="animate-spin" /> Entrando…</> : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
