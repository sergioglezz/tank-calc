import { formatLiters } from '../lib/format'
import type { CarOption } from '../lib/ownCars'
import { ScreenTitle } from './ScreenTitle'
import { Welcome } from './Welcome'

interface CalculatorScreenProps {
  car: CarOption | null
  focusOnMount: boolean
  onChooseCar: () => void
}

export function CalculatorScreen({
  car,
  focusOnMount,
  onChooseCar,
}: CalculatorScreenProps) {
  return (
    <>
      <ScreenTitle focusOnMount={focusOnMount}>Calculadora</ScreenTitle>
      {car === null ? (
        <Welcome onChooseCar={onChooseCar} />
      ) : (
        <section
          aria-label="Tu coche"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-wide text-muted uppercase">
              Tu coche
            </p>
            <p className="mt-1 text-lg font-semibold break-words">
              {car.label} · {formatLiters(car.capacity)}
            </p>
          </div>
          <button
            type="button"
            onClick={onChooseCar}
            aria-label="Cambiar coche"
            className="min-h-11 shrink-0 rounded-xl bg-mist px-4 text-lg font-semibold hover:bg-line"
          >
            Cambiar
          </button>
        </section>
      )}
    </>
  )
}
