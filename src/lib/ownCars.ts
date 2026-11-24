import {
  catalogKey,
  catalogLabel,
  findCatalogCar,
  type CatalogCar,
} from './carCatalog'
import { normalizeText } from './text'
import { validateCapacity, type FieldResult } from './validation'

export interface OwnCar {
  name: string
  /** Tank capacity in whole liters. */
  capacity: number
}

/** A reference to a car: a catalog entry by its key (D3) or an own car by name. */
export type CarRef =
  { source: 'catalog'; key: string } | { source: 'own'; name: string }

export interface CarOption {
  ref: CarRef
  label: string
  capacity: number
}

export interface CarState {
  ownCars: readonly OwnCar[]
  selected: CarRef | null
}

export type AddCarResult =
  | { ok: true; state: CarState }
  | {
      ok: false
      errors: { name?: string; capacity?: string; limit?: string }
    }

export const MAX_OWN_CARS = 10
export const MAX_NAME_LENGTH = 40

const NAME_EMPTY = 'Introduce un nombre para el coche.'
const NAME_TOO_LONG = 'Escribe un nombre de 40 caracteres como máximo.'
const NAME_TAKEN = 'Ya tienes un coche con ese nombre.'
/** Shown instead of the form when there are already 10 own cars. */
export const LIMIT_REACHED =
  'Ya tienes 10 coches guardados. Borra uno para añadir otro.'

const sameName = (a: string, b: string): boolean =>
  normalizeText(a) === normalizeText(b)

export function validateCarName(
  text: string,
  ownCars: readonly OwnCar[],
): FieldResult<string> {
  const name = text.trim()
  if (name === '') return { ok: false, reason: 'empty', message: NAME_EMPTY }
  // Count code points so an accent or an emoji does not count twice.
  if ([...name].length > MAX_NAME_LENGTH) {
    return { ok: false, reason: 'invalid', message: NAME_TOO_LONG }
  }
  if (ownCars.some((car) => sameName(car.name, name))) {
    return { ok: false, reason: 'invalid', message: NAME_TAKEN }
  }
  return { ok: true, value: name }
}

export function addOwnCar(
  state: CarState,
  nameText: string,
  capacityText: string,
): AddCarResult {
  if (state.ownCars.length >= MAX_OWN_CARS) {
    return { ok: false, errors: { limit: LIMIT_REACHED } }
  }
  const name = validateCarName(nameText, state.ownCars)
  const capacity = validateCapacity(capacityText)
  if (!name.ok || !capacity.ok) {
    return {
      ok: false,
      errors: {
        ...(name.ok ? {} : { name: name.message }),
        ...(capacity.ok ? {} : { capacity: capacity.message }),
      },
    }
  }
  const car: OwnCar = { name: name.value, capacity: capacity.value }
  return { ok: true, state: { ...state, ownCars: [...state.ownCars, car] } }
}

export function removeOwnCar(state: CarState, name: string): CarState {
  const { selected } = state
  const wasSelected =
    selected?.source === 'own' && sameName(selected.name, name)
  return {
    ownCars: state.ownCars.filter((car) => !sameName(car.name, name)),
    selected: wasSelected ? null : selected,
  }
}

/** Whether two references point to the same car (own names ignore case and accents). */
export const isSameCar = (a: CarRef, b: CarRef): boolean =>
  a.source === 'catalog'
    ? b.source === 'catalog' && a.key === b.key
    : b.source === 'own' && sameName(a.name, b.name)

export const selectCar = (state: CarState, ref: CarRef | null): CarState => ({
  ...state,
  selected: ref,
})

export const ownCarOption = (car: OwnCar): CarOption => ({
  ref: { source: 'own', name: car.name },
  label: car.name,
  capacity: car.capacity,
})

export const catalogCarOption = (car: CatalogCar): CarOption => ({
  ref: { source: 'catalog', key: catalogKey(car) },
  label: catalogLabel(car),
  capacity: car.capacity,
})

/** The selected car with its capacity, or null if none or it no longer exists. */
export function resolveSelected({
  ownCars,
  selected,
}: CarState): CarOption | null {
  if (selected === null) return null
  if (selected.source === 'catalog') {
    const car = findCatalogCar(selected.key)
    return car ? catalogCarOption(car) : null
  }
  const car = ownCars.find((own) => sameName(own.name, selected.name))
  return car ? ownCarOption(car) : null
}
