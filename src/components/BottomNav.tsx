export type Section = 'calculator' | 'history'

interface BottomNavProps {
  active: Section
  onNavigate: (section: Section) => void
}

const ITEMS: readonly [Section, string, string][] = [
  // Simple outline icons: a calculator and a clock with an arrow.
  [
    'calculator',
    'Calculadora',
    'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 3h8v3H8Zm0 6h2m3 0h2m-7 3h2m3 0h2',
  ],
  ['history', 'Historial', 'M3 12a9 9 0 1 0 3-6.7M3 4v4h4m5-1v5l3 2'],
]

/** Fixed at the bottom of every screen (CA1 of spec 005). */
export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 border-t border-line bg-card"
    >
      <ul className="mx-auto grid max-w-md grid-cols-2 gap-2 px-5 py-2">
        {ITEMS.map(([section, label, icon]) => {
          const current = section === active
          return (
            <li key={section}>
              <button
                type="button"
                aria-current={current ? 'page' : undefined}
                onClick={() => onNavigate(section)}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl text-sm font-semibold ${
                  current ? 'bg-lime' : 'text-muted hover:bg-mist'
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={icon} />
                </svg>
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
