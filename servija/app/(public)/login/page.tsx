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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-base font-semibold text-ink tracking-tight">
            Servi<span className="text-brand">Já</span>
          </Link>
          <h1 className="text-xl font-semibold text-ink mt-5 mb-1.5 tracking-tight">
            Entrar na conta
          </h1>
          <p className="text-sm text-muted">
            Não tem conta?{' '}
            <Link href="/registro" className="text-brand font-medium hover:underline underline-offset-2">
              Criar conta grátis
            </Link>
          </p>
        </div>

        <div className="card-surface p-6 sm:p-7">
          {/* Tipo switcher */}
          <div className="segmented-control mb-5">
            {(['CLIENTE', 'PRESTADOR'] as UserRole[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`segmented-control-btn
                  ${tipo === t ? 'segmented-control-btn-active' : 'segmented-control-btn-idle'}`}
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
                className="input-field"
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
                className="input-field"
              />
            </div>

            {formError && (
              <p className="text-xs text-danger bg-danger-subtle border border-danger/20 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-1"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Entrando…</> : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
