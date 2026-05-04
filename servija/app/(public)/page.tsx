import Link from 'next/link'
import {
  Scissors,
  Zap,
  Wrench,
  Sparkles,
  PawPrint,
  Home,
  Hammer,
  Paintbrush,
  Search,
  CalendarCheck,
  Star,
  ArrowRight,
} from 'lucide-react'

const CATEGORIAS = [
  { icon: Scissors,   nome: 'Cabelereiro',  slug: 'cabeleireiro' },
  { icon: Sparkles,   nome: 'Manicure',     slug: 'manicure' },
  { icon: Zap,        nome: 'Eletricista',  slug: 'eletricista' },
  { icon: Wrench,     nome: 'Encanador',    slug: 'encanador' },
  { icon: Home,       nome: 'Limpeza',      slug: 'limpeza' },
  { icon: PawPrint,   nome: 'Pet',          slug: 'pet' },
  { icon: Paintbrush, nome: 'Estética',     slug: 'estetica' },
  { icon: Hammer,     nome: 'Marceneiro',   slug: 'marceneiro' },
]

const COMO_FUNCIONA = [
  {
    icon: Search,
    titulo: 'Busque pelo serviço',
    descricao: 'Pesquise por cidade, bairro ou categoria e veja perfis com avaliações reais.',
  },
  {
    icon: CalendarCheck,
    titulo: 'Agende em minutos',
    descricao: 'Escolha o serviço, horário e forma de pagamento. Sem ligação, sem complicação.',
  },
  {
    icon: Star,
    titulo: 'Avalie e contribua',
    descricao: 'Após o serviço, deixe sua avaliação e ajude outros clientes a escolher.',
  },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface px-6 py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center text-xs font-medium text-brand bg-brand-subtle border border-brand/20 px-3 py-1 rounded-sm mb-6">
            Plataforma de serviços locais
          </span>
          <h1 className="hero-title mb-4">
            Encontre o serviço certo,
            <br />
            na hora certa.
          </h1>
          <p className="text-lg text-muted max-w-md mx-auto mb-8 leading-relaxed">
            Cabeleireiros, eletricistas, manicures e muito mais — agende em minutos, sem ligação.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/busca"
              className="h-10 px-6 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors duration-150 active:scale-[0.98] inline-flex items-center gap-2"
            >
              Encontrar prestadores
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/registro?tipo=prestador"
              className="h-10 px-6 rounded-md border border-border-strong text-sm font-medium text-ink hover:bg-surface transition-colors duration-150"
            >
              Sou prestador
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="bg-card border-t border-border px-6 py-16">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="text-xl font-semibold text-ink mb-1">
            Busque por categoria
          </h2>
          <p className="text-sm text-muted mb-8">
            As categorias mais procuradas na plataforma.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.slug}
                  href={`/busca?categoria=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-surface hover:border-border-strong hover:bg-card transition-all duration-150 text-center group"
                >
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    className="text-muted group-hover:text-brand transition-colors duration-150"
                  />
                  <span className="text-xs font-medium text-ink group-hover:text-brand transition-colors duration-150">
                    {cat.nome}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-surface border-t border-border px-6 py-16">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="text-xl font-semibold text-ink mb-1">
            Como funciona
          </h2>
          <p className="text-sm text-muted mb-10">
            Três passos para o seu serviço agendado.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {COMO_FUNCIONA.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xs font-semibold text-subtle">0{i + 1}</span>
                    <Icon size={18} strokeWidth={1.75} className="text-brand mt-0.5 shrink-0" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink mb-1">{item.titulo}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.descricao}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-brand px-6 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">
            Pronto para começar?
          </h2>
          <p className="text-sm text-white/75 mb-8">
            Cadastre seu negócio ou encontre o profissional ideal para você.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/registro?tipo=prestador"
              className="h-10 px-6 rounded-md bg-white text-brand text-sm font-medium hover:bg-white/90 transition-colors duration-150 active:scale-[0.98]"
            >
              Cadastrar meu negócio
            </Link>
            <Link
              href="/busca"
              className="h-10 px-6 rounded-md border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors duration-150"
            >
              Buscar serviços
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
