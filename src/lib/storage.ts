import { litersForEuros } from './calculator'
import { isValidIsoDate } from './dates'
import { formatPriceInput } from './format'
import {
  MAX_NAME_LENGTH,
  MAX_OWN_CARS,
  resolveSelected,
  validateCarName,
  type CarRef,
  type CarState,
  type OwnCar,
} from './ownCars'
import {
  MAX_REFUELS,
  sortRefuels,
  type Refuel,
  type RefuelHistory,
} from './refuels'
import {
  validateCapacity,
  validatePaidEuros,
  validatePrice,
} from './validation'

/** The part of `localStorage` this app uses; tests pass a fake one (D4). */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

export interface SavedData {
  cars: CarState
  /** Price text ready for the input field («1,579»), or null. */
  price: string | null
}

/** One key per value, so a damaged one does not affect the others (D4). */
export const STORAGE_KEYS = {
  ownCars: 'tank-calc:own-cars',
  selectedCar: 'tank-calc:selected-car',
  price: 'tank-calc:price',
  refuels: 'tank-calc:refuels',
} as const

/** `localStorage`, or null when the browser does not allow using it. */
export function getBrowserStorage(): KeyValueStore | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function read(storage: KeyValueStore | null, key: string): string | null {
  if (storage === null) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function parseJson(text: string | null): unknown {
  if (text === null) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Keeps the first valid cars, up to the limit; repeated names keep the first. */
function toOwnCars(value: unknown): OwnCar[] {
  if (!Array.isArray(value)) return []
  const cars: OwnCar[] = []
  for (const item of value) {
    if (cars.length === MAX_OWN_CARS) break
    if (!isRecord(item)) continue
    if (typeof item.name !== 'string' || typeof item.capacity !== 'number') {
      continue
    }
    const name = validateCarName(item.name, cars)
    const capacity = validateCapacity(String(item.capacity))
    if (name.ok && capacity.ok) {
      cars.push({ name: name.value, capacity: capacity.value })
    }
  }
  return cars
}

function toCarRef(value: unknown): CarRef | null {
  if (!isRecord(value)) return null
  if (value.source === 'catalog' && typeof value.key === 'string') {
    return { source: 'catalog', key: value.key }
  }
  if (value.source === 'own' && typeof value.name === 'string') {
    return { source: 'own', name: value.name }
  }
  return null
}

function toPrice(text: string | null): string | null {
  if (text === null) return null
  const price = validatePrice(text)
  return price.ok ? formatPriceInput(price.value) : null
}

/** Never throws: anything missing, unreadable or invalid is left empty. */
export function loadSavedData(storage: KeyValueStore | null): SavedData {
  const ownCars = toOwnCars(parseJson(read(storage, STORAGE_KEYS.ownCars)))
  const ref = toCarRef(parseJson(read(storage, STORAGE_KEYS.selectedCar)))
  // Only a car that still exists stays selected.
  const selected = resolveSelected({ ownCars, selected: ref })?.ref ?? null
  return {
    cars: { ownCars, selected },
    price: toPrice(read(storage, STORAGE_KEYS.price)),
  }
}

/** Returns false when the values could not be saved. */
function write(
  storage: KeyValueStore | null,
  entries: [key: string, value: string][],
): boolean {
  if (storage === null) return false
  try {
    for (const [key, value] of entries) storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Saves the own cars and the selected car; false if it could not be saved. */
export const saveCarState = (
  storage: KeyValueStore | null,
  { ownCars, selected }: CarState,
): boolean =>
  write(storage, [
    [STORAGE_KEYS.ownCars, JSON.stringify(ownCars)],
    [STORAGE_KEYS.selectedCar, JSON.stringify(selected)],
  ])

/**
 * Saves a valid price in its canonical form. An invalid price is not saved
 * and keeps the previous one; that is not a failure, so it returns true.
 */
export function savePrice(
  storage: KeyValueStore | null,
  text: string,
): boolean {
  const price = validatePrice(text)
  if (!price.ok) return true
  return write(storage, [[STORAGE_KEYS.price, formatPriceInput(price.value)]])
}

/** A car name as saved by `addRefuel`: 1–40 characters, already trimmed. */
const isSavedCarName = (car: unknown): car is string | null =>
  car === null ||
  (typeof car === 'string' &&
    car === car.trim() &&
    car !== '' &&
    [...car].length <= MAX_NAME_LENGTH)

/** A saved refuel that follows the rules, or null. Date limits do not apply. */
function toRefuel(item: unknown): Refuel | null {
  if (!isRecord(item)) return null
  const { id, date, euros, price, liters, car } = item
  // Beyond the safe integers, the next id could repeat this one (D5).
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1) return null
  if (typeof date !== 'string' || !isValidIsoDate(date)) return null
  if (typeof euros !== 'number' || typeof price !== 'number') return null
  if (!validatePaidEuros(String(euros)).ok) return null
  if (!validatePrice(String(price)).ok) return null
  if (liters !== litersForEuros(euros, price)) return null
  if (!isSavedCarName(car)) return null
  return { id, date, euros, price, liters, car }
}

/** Keeps the valid refuels, the first of each id, and the 500 most recent. */
function toRefuels(value: unknown): RefuelHistory {
  if (!Array.isArray(value)) return []
  const refuels: Refuel[] = []
  const ids = new Set<number>()
  for (const item of value) {
    const refuel = toRefuel(item)
    if (refuel === null || ids.has(refuel.id)) continue
    ids.add(refuel.id)
    refuels.push(refuel)
  }
  return sortRefuels(refuels).slice(0, MAX_REFUELS)
}

/** Never throws: anything missing or unreadable gives an empty history. */
export const loadRefuels = (storage: KeyValueStore | null): RefuelHistory =>
  toRefuels(parseJson(read(storage, STORAGE_KEYS.refuels)))

/** Saves the history; false if it could not be saved. */
export const saveRefuels = (
  storage: KeyValueStore | null,
  history: RefuelHistory,
): boolean => write(storage, [[STORAGE_KEYS.refuels, JSON.stringify(history)]])
