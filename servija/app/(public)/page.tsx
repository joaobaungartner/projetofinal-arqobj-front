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

/** Imagem do hero: coloque o arquivo em `public/images/` com este nome (jpg, png ou webp). */
const HERO_BACKGROUND = '/images/hero-bg.jpg'

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
      {/* Hero — altura mínima ampla na vertical; conteúdo centralizado */}
      <section className="relative flex min-h-[64vh] flex-col items-center justify-center overflow-hidden bg-neutral-900 px-4 py-16 sm:min-h-[70vh] sm:py-20 md:min-h-[76vh] md:py-24 lg:min-h-[83vh] lg:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.72] contrast-[1.06] saturate-[1.08]"
          style={{ backgroundImage: `url('${HERO_BACKGROUND}')` }}
          aria-hidden
        />
        {/* Vinheta: escurece bordas e mantém centro legível */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_45%,transparent_20%,rgb(15_23_42/0.55)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55"
          aria-hidden
        />
        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
          <span className="mb-6 inline-flex items-center rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            Plataforma de serviços locais
          </span>
          <h1 className="hero-title-on-photo mb-4 drop-shadow-md">
            Encontre o serviço certo,
            <br />
            na hora certa.
          </h1>
          <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-white/85 sm:text-lg drop-shadow-sm">
            Cabeleireiros, eletricistas, manicures e muito mais — agende em minutos, sem ligação.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/busca"
              className="btn-primary px-7 shadow-lg shadow-brand/20"
            >
              Encontrar prestadores
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/registro?tipo=prestador"
              className="btn-secondary px-6"
            >
              Sou prestador
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="bg-card border-t border-border/80 px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-ink mb-1 tracking-tight">
            Busque por categoria
          </h2>
          <p className="text-sm text-muted mb-8 max-w-lg">
            As categorias mais procuradas na plataforma.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.slug}
                  href={`/busca?categoria=${cat.slug}`}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border bg-surface/80 hover:bg-card hover:border-brand/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center group"
                >
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    className="text-muted group-hover:text-brand transition-colors duration-200"
                  />
                  <span className="text-xs font-medium text-ink group-hover:text-brand transition-colors duration-200">
                    {cat.nome}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-surface border-t border-border/80 px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-ink mb-1 tracking-tight">
            Como funciona
          </h2>
          <p className="text-sm text-muted mb-10 max-w-lg">
            Três passos para o seu serviço agendado.
          </p>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {COMO_FUNCIONA.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="card-surface p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xs font-semibold tabular-nums text-subtle">0{i + 1}</span>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-ink mb-1.5">{item.titulo}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.descricao}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-brand px-4 sm:px-6 py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_100%_0%,rgba(255,255,255,0.12),transparent)]" aria-hidden />
        <div className="relative max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">
            Pronto para começar?
          </h2>
          <p className="text-sm text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
            Cadastre seu negócio ou encontre o profissional ideal para você.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/registro?tipo=prestador"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-brand shadow-lg shadow-black/10 transition-transform duration-200 hover:bg-white/95 active:scale-[0.98]"
            >
              Cadastrar meu negócio
            </Link>
            <Link
              href="/busca"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/35 px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
            >
              Buscar serviços
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
