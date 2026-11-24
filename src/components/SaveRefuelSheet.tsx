import { useState, type FormEvent } from 'react'
import { shiftDays, type IsoDate } from '../lib/dates'
import type { RefuelInput } from '../lib/refuels'
import {
  MAX_REFUEL_AGE_DAYS,
  validatePaidEuros,
  validatePrice,
  validateRefuelDate,
} from '../lib/validation'
import { BottomSheet } from './BottomSheet'
import { NumberField } from './NumberField'

interface SaveRefuelSheetProps {
  open: boolean
  /** Values the form starts with: the calculator's result and today. */
  initial: RefuelInput
  today: IsoDate
  /** The selected car as shown, saved with the refuel. */
  carLabel: string
  /** Saves the refuel; only called with valid data. */
  onSave: (input: RefuelInput) => void
  onClose: () => void
}

/** «Guardar repostaje» (CA6–CA8 and CA11 of spec 005). */
export function SaveRefuelSheet({
  open,
  initial,
  today,
  carLabel,
  onSave,
  onClose,
}: SaveRefuelSheetProps) {
  return (
    <BottomSheet open={open} title="Guardar repostaje" onClose={onClose}>
      <SaveRefuelForm
        initial={initial}
        today={today}
        carLabel={carLabel}
        onSave={onSave}
        onCancel={onClose}
      />
    </BottomSheet>
  )
}

type FormField = 'euros' | 'price' | 'date'

interface SaveRefuelFormProps {
  initial: RefuelInput
  today: IsoDate
  carLabel: string
  onSave: (input: RefuelInput) => void
  onCancel: () => void
}

/** Mounted each time the sheet opens, so it starts from the latest result. */
function SaveRefuelForm({
  initial,
  today,
  carLabel,
  onSave,
  onCancel,
}: SaveRefuelFormProps) {
  const [euros, setEuros] = useState(initial.eurosText)
  const [price, setPrice] = useState(initial.priceText)
  const [date, setDate] = useState(initial.dateText)
  const [touched, setTouched] = useState<Partial<Record<FormField, true>>>({})

  // The same rules addRefuel applies (CA6 of spec 003).
  const results = {
    euros: validatePaidEuros(euros),
    price: validatePrice(price),
    date: validateRefuelDate(date, today),
  }
  const errorOf = (field: FormField): string | null => {
    const result = results[field]
    return touched[field] && !result.ok ? result.message : null
  }
  const touch = (field: FormField) => () =>
    setTouched((current) => ({ ...current, [field]: true }))

  const save = (event: FormEvent) => {
    event.preventDefault()
    // «Guardar» shows every error at once (CA8).
    setTouched({ euros: true, price: true, date: true })
    if (results.euros.ok && results.price.ok && results.date.ok) {
      onSave({ eurosText: euros, priceText: price, dateText: date })
    }
  }

  const dateError = errorOf('date')

  return (
    <form noValidate onSubmit={save}>
      <p className="mt-2 break-words text-muted">
        Se guardará con tu coche: {carLabel}.
      </p>

      <NumberField
        id="refuel-euros"
        label="Euros pagados (€)"
        unit="€"
        integer
        value={euros}
        error={errorOf('euros')}
        onChange={setEuros}
        onBlur={touch('euros')}
      />
      <NumberField
        id="refuel-price"
        label="Precio por litro (€/l)"
        unit="€/l"
        value={price}
        error={errorOf('price')}
        onChange={setPrice}
        onBlur={touch('price')}
      />

      <label htmlFor="refuel-date" className="mt-6 block text-lg font-semibold">
        Fecha
      </label>
      <input
        id="refuel-date"
        type="date"
        min={shiftDays(today, -MAX_REFUEL_AGE_DAYS)}
        max={today}
        value={date}
        onChange={(event) => setDate(event.target.value)}
        onBlur={touch('date')}
        aria-invalid={dateError === null ? undefined : true}
        aria-describedby={dateError === null ? undefined : 'refuel-date-error'}
        className={`mt-2 h-14 w-full rounded-2xl border px-4 text-lg focus:ring-2 focus:ring-ink focus:outline-none ${
          dateError === null
            ? 'border-line bg-card'
            : 'border-danger bg-danger-soft'
        }`}
      />
      {dateError !== null && (
        <p id="refuel-date-error" className="mt-2 text-danger">
          {dateError}
        </p>
      )}

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          className="min-h-14 w-full rounded-2xl bg-lime px-4 text-lg font-bold hover:bg-lime-dark"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-14 w-full rounded-2xl border border-line px-4 text-lg font-bold hover:bg-mist"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
