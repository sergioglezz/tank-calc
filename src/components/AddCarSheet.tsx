import { useState, type FormEvent } from 'react'
import {
  LIMIT_REACHED,
  MAX_OWN_CARS,
  validateCarName,
  type OwnCar,
} from '../lib/ownCars'
import { validateCapacity } from '../lib/validation'
import { BottomSheet } from './BottomSheet'
import { NumberField } from './NumberField'

interface AddCarSheetProps {
  open: boolean
  ownCars: readonly OwnCar[]
  /** Adds the car; only called with valid data. */
  onSave: (name: string, capacity: string) => void
  onClose: () => void
}

/** «Añadir mi coche» (CA24–CA28). */
export function AddCarSheet({
  open,
  ownCars,
  onSave,
  onClose,
}: AddCarSheetProps) {
  return (
    <BottomSheet open={open} title="Añadir mi coche" onClose={onClose}>
      {ownCars.length >= MAX_OWN_CARS ? (
        <>
          <p className="mt-3">{LIMIT_REACHED}</p>
          <button
            type="button"
            onClick={onClose}
            data-autofocus
            className="mt-6 min-h-14 w-full rounded-2xl border border-line px-4 text-lg font-bold hover:bg-mist"
          >
            Cerrar
          </button>
        </>
      ) : (
        <AddCarForm ownCars={ownCars} onSave={onSave} onCancel={onClose} />
      )}
    </BottomSheet>
  )
}

interface AddCarFormProps {
  ownCars: readonly OwnCar[]
  onSave: (name: string, capacity: string) => void
  onCancel: () => void
}

/** Mounted each time the sheet opens, so it always starts empty. */
function AddCarForm({ ownCars, onSave, onCancel }: AddCarFormProps) {
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [touched, setTouched] = useState({ name: false, capacity: false })

  // The same rules addOwnCar applies (CA13 of spec 002).
  const nameResult = validateCarName(name, ownCars)
  const capacityResult = validateCapacity(capacity)
  const nameError = touched.name && !nameResult.ok ? nameResult.message : null
  const capacityError =
    touched.capacity && !capacityResult.ok ? capacityResult.message : null

  const save = (event: FormEvent) => {
    event.preventDefault()
    // «Guardar» shows every error at once (CA25).
    setTouched({ name: true, capacity: true })
    if (nameResult.ok && capacityResult.ok) onSave(name, capacity)
  }

  return (
    <form noValidate onSubmit={save}>
      <p className="mt-2 text-muted">
        Ponle un nombre y consulta los litros en el manual de tu coche.
      </p>

      <label htmlFor="car-name" className="mt-6 block text-lg font-semibold">
        Nombre
      </label>
      <input
        id="car-name"
        type="text"
        autoComplete="off"
        placeholder="Ej. Coche de casa"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => setTouched((current) => ({ ...current, name: true }))}
        aria-invalid={nameError === null ? undefined : true}
        aria-describedby={nameError === null ? undefined : 'car-name-error'}
        className={`mt-2 h-14 w-full rounded-2xl border px-4 text-lg placeholder:text-muted focus:ring-2 focus:ring-ink focus:outline-none ${
          nameError === null
            ? 'border-line bg-card'
            : 'border-danger bg-danger-soft'
        }`}
      />
      {nameError !== null && (
        <p id="car-name-error" className="mt-2 text-danger">
          {nameError}
        </p>
      )}

      <NumberField
        id="car-capacity"
        label="Capacidad del depósito (l)"
        unit="l"
        placeholder="Ej. 50"
        integer
        value={capacity}
        error={capacityError}
        onChange={setCapacity}
        onBlur={() => setTouched((current) => ({ ...current, capacity: true }))}
      />

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
