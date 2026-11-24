import { useEffect, useRef, useState } from 'react'
import {
  evaluateCalculator,
  type CalculatorFields,
  type Mode,
} from '../lib/calculatorForm'
import type { IsoDate } from '../lib/dates'
import { formatLiters } from '../lib/format'
import type { CarOption } from '../lib/ownCars'
import type { RefuelInput } from '../lib/refuels'
import { describeResult } from '../lib/resultText'
import { ModeSelector } from './ModeSelector'
import { NumberField } from './NumberField'
import { ResultCard } from './ResultCard'
import { SaveRefuelSheet } from './SaveRefuelSheet'
import { ScreenTitle } from './ScreenTitle'
import { Welcome } from './Welcome'

export type Field = keyof CalculatorFields

/** Kept in `App` so nothing is lost while choosing a car (CA5). */
export interface CalculatorFormState {
  mode: Mode
  fields: CalculatorFields
  /** Fields the user has left at least once (CA10). */
  touched: Partial<Record<Field, true>>
}

const QUICK_LEVELS = ['25', '50', '75'] as const

interface CalculatorScreenProps {
  car: CarOption | null
  form: CalculatorFormState
  focusOnMount: boolean
  onChooseCar: () => void
  onFieldChange: (field: Field, value: string) => void
  onTouch: (field: Field) => void
  onModeChange: (mode: Mode) => void
  /** Whether «Repostaje guardado» is shown (CA9–CA10 of spec 005). */
  justSaved: boolean
  getToday: () => IsoDate
  onOpenSave: () => void
  /** Saves the refuel; true if it was saved. */
  onSaveRefuel: (input: RefuelInput) => boolean
}

export function CalculatorScreen({
  car,
  focusOnMount,
  onChooseCar,
  ...calculatorProps
}: CalculatorScreenProps) {
  return (
    <>
      <ScreenTitle focusOnMount={focusOnMount}>Calculadora</ScreenTitle>
      {car === null ? (
        <Welcome onChooseCar={onChooseCar} />
      ) : (
        <Calculator car={car} onChooseCar={onChooseCar} {...calculatorProps} />
      )}
    </>
  )
}

type CalculatorProps = Omit<CalculatorScreenProps, 'car' | 'focusOnMount'> & {
  car: CarOption
}

function Calculator({
  car,
  form: { mode, fields, touched },
  onChooseCar,
  onFieldChange,
  onTouch,
  onModeChange,
  justSaved,
  getToday,
  onOpenSave,
  onSaveRefuel,
}: CalculatorProps) {
  const [saving, setSaving] = useState(false)
  const savedRef = useRef<HTMLParagraphElement>(null)

  // Bring «Repostaje guardado» above the bottom bar when it appears.
  useEffect(() => {
    if (justSaved) savedRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [justSaved])
  // Recalculated on every render: any change updates the result and, once a
  // field has been left, its error (CA6, CA12, CA13).
  const evaluation = evaluateCalculator(car.capacity, mode, fields)
  const result = evaluation.result

  // Only rendered fields show errors, so hidden modes hide theirs (CA14).
  const errorOf = (name: Field): string | null => {
    const validated = evaluation[name]
    return touched[name] && !validated.ok ? validated.message : null
  }

  const field = (name: Field) => ({
    id: name,
    value: fields[name],
    error: errorOf(name),
    onChange: (value: string) => onFieldChange(name, value),
    onBlur: () => onTouch(name),
  })

  return (
    <>
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

      <NumberField
        {...field('level')}
        label="Nivel actual (%)"
        unit="%"
        integer
      >
        <div className="mt-2 grid grid-cols-3 gap-2">
          {QUICK_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                onFieldChange('level', level)
                onTouch('level')
              }}
              className="min-h-11 rounded-xl bg-mist text-lg font-semibold hover:bg-line"
            >
              {level} %
            </button>
          ))}
        </div>
      </NumberField>

      <NumberField
        {...field('price')}
        label="Precio por litro (€/l)"
        unit="€/l"
      />

      <ModeSelector mode={mode} onChange={onModeChange} />

      {mode === 'toLevel' && (
        <NumberField {...field('target')} label="% objetivo" unit="%" integer />
      )}
      {mode === 'withMoney' && (
        <NumberField
          {...field('money')}
          label="Euros que tienes"
          unit="€"
          integer
        />
      )}

      <ResultCard
        text={describeResult(mode, evaluation)}
        emphasis={result?.status === 'ok'}
      />

      {/* Only a result with figures can be saved (CA5 of spec 005). */}
      <button
        type="button"
        disabled={result?.status !== 'ok'}
        onClick={() => {
          onOpenSave()
          setSaving(true)
        }}
        className="mt-6 min-h-14 w-full rounded-2xl bg-lime px-4 text-lg font-bold hover:bg-lime-dark disabled:bg-mist disabled:text-muted"
      >
        Guardar repostaje
      </button>
      <div role="status">
        {justSaved && (
          <p
            ref={savedRef}
            className="mt-4 flex scroll-mb-28 items-center gap-3 rounded-2xl bg-ink p-4 font-semibold text-white"
          >
            <span aria-hidden="true" className="text-lime">
              ✓
            </span>
            Repostaje guardado
          </p>
        )}
      </div>

      {result?.status === 'ok' && (
        <SaveRefuelSheet
          open={saving}
          initial={{
            eurosText: String(result.euros),
            priceText: fields.price,
            dateText: getToday(),
          }}
          today={getToday()}
          carLabel={car.label}
          onSave={(input) => {
            if (onSaveRefuel(input)) setSaving(false)
          }}
          onClose={() => setSaving(false)}
        />
      )}
    </>
  )
}
