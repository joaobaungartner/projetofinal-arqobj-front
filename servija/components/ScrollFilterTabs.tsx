'use client'

interface TabItem {
  key: string
  label: string
}

interface ScrollFilterTabsProps {
  tabs: TabItem[]
  active: string
  onChange: (key: string) => void
  countFor: (key: string) => number
}

export function ScrollFilterTabs({ tabs, active, onChange, countFor }: ScrollFilterTabsProps) {
  return (
    <div className="relative mb-6">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-linear-to-r from-surface to-transparent md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-surface to-transparent md:hidden"
        aria-hidden
      />
      <div
        className="scrollbar-tabs relative z-0 -mx-1 flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-smooth px-1 pb-2 [-webkit-overflow-scrolling:touch]"
        role="tablist"
        aria-label="Filtrar por status"
      >
        {tabs.map((tab) => {
          const count = countFor(tab.key)
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all duration-200
                ${isActive
                  ? 'bg-brand-subtle text-brand shadow-sm ring-1 ring-brand/15'
                  : 'text-muted hover:bg-surface hover:text-ink'
                }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`tabular-nums rounded-md px-1.5 py-0.5 text-[10px] font-semibold
                    ${isActive ? 'bg-brand/15 text-brand' : 'bg-border/80 text-muted'}`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
