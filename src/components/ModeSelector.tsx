import type { Mode } from '../lib/calculatorForm'

const MODES: readonly [Mode, string][] = [
  ['fullTank', 'A tope'],
  ['toLevel', 'Hasta X %'],
  ['withMoney', 'Tengo X €'],
]

interface ModeSelectorProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

/** Three toggle buttons; `aria-pressed` tells which mode is active (CA34). */
export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Modo de cálculo"
      className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-mist p-1"
    >
      {MODES.map(([value, label]) => {
        const active = value === mode
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`min-h-12 rounded-xl px-1 font-semibold ${
              active ? 'bg-ink text-white' : 'text-muted hover:bg-line'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
