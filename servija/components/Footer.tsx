import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="text-sm font-semibold text-ink mb-3">
              Servi<span className="text-brand">Já</span>
            </p>
            <p className="text-xs text-muted leading-relaxed">
              Conectando clientes e prestadores de serviços locais.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Plataforma</p>
            <ul className="space-y-2">
              <li><Link href="/busca" className="text-xs text-muted hover:text-brand transition-colors duration-200">Buscar serviços</Link></li>
              <li><Link href="/registro" className="text-xs text-muted hover:text-brand transition-colors duration-200">Criar conta</Link></li>
              <li><Link href="/login" className="text-xs text-muted hover:text-brand transition-colors duration-200">Entrar</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Prestadores</p>
            <ul className="space-y-2">
              <li><Link href="/registro?tipo=prestador" className="text-xs text-muted hover:text-brand transition-colors duration-200">Cadastre seu negócio</Link></li>
              <li><Link href="/prestador/dashboard" className="text-xs text-muted hover:text-brand transition-colors duration-200">Painel</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Suporte</p>
            <ul className="space-y-2">
              <li><span className="text-xs text-muted">Central de ajuda</span></li>
              <li><span className="text-xs text-muted">Contato</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/80 pt-8">
          <p className="text-xs text-subtle">
            © {new Date().getFullYear()} ServiJá. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
