import { litersForEuros } from './calculator'
import type { IsoDate } from './dates'
import { resolveSelected, type CarState } from './ownCars'
import {
  validatePaidEuros,
  validatePrice,
  validateRefuelDate,
} from './validation'

export interface Refuel {
  /** Whole number ≥ 1; a higher id was saved later (D5). */
  id: number
  date: IsoDate
  /** Whole euros paid (1–1000). */
  euros: number
  /** Euros per liter, with up to three decimals. */
  price: number
  /** Whole liters those euros buy, truncated. */
  liters: number
  /** The car's name as it was shown when saving, or null. */
  car: string | null
}

/** Always sorted: most recent date first; same day, last saved first. */
export type RefuelHistory = readonly Refuel[]

export interface RefuelInput {
  eurosText: string
  priceText: string
  /** AAAA-MM-DD, or empty for today. */
  dateText: string
}

export type AddRefuelResult =
  | { ok: true; history: RefuelHistory }
  | { ok: false; errors: { euros?: string; price?: string; date?: string } }

export interface DailySpending {
  date: IsoDate
  /** Whole euros spent that day. */
  euros: number
}

export const MAX_REFUELS = 500

const newestFirst = (a: Refuel, b: Refuel): number => {
  if (a.date !== b.date) return a.date > b.date ? -1 : 1
  return b.id - a.id
}

export const sortRefuels = (history: readonly Refuel[]): RefuelHistory =>
  [...history].sort(newestFirst)

const nextId = (history: RefuelHistory): number =>
  history.reduce((max, refuel) => Math.max(max, refuel.id), 0) + 1

/**
 * Saves a refuel with the selected car's name. With the history full, the
 * oldest one already saved is dropped, even if the new one is older.
 */
export function addRefuel(
  history: RefuelHistory,
  input: RefuelInput,
  cars: CarState,
  today: IsoDate,
): AddRefuelResult {
  const euros = validatePaidEuros(input.eurosText)
  const price = validatePrice(input.priceText)
  const date = validateRefuelDate(input.dateText, today)
  if (!euros.ok || !price.ok || !date.ok) {
    return {
      ok: false,
      errors: {
        ...(euros.ok ? {} : { euros: euros.message }),
        ...(price.ok ? {} : { price: price.message }),
        ...(date.ok ? {} : { date: date.message }),
      },
    }
  }
  const refuel: Refuel = {
    id: nextId(history),
    date: date.value,
    euros: euros.value,
    price: price.value,
    liters: litersForEuros(euros.value, price.value),
    car: resolveSelected(cars)?.label ?? null,
  }
  const kept = sortRefuels(history).slice(0, MAX_REFUELS - 1)
  return { ok: true, history: sortRefuels([...kept, refuel]) }
}

/** Removes only the refuel with that id; an unknown id changes nothing. */
export const removeRefuel = (
  history: RefuelHistory,
  id: number,
): RefuelHistory => history.filter((refuel) => refuel.id !== id)

/** The most recent refuel, or null with an empty history. */
export const lastRefuel = (history: RefuelHistory): Refuel | null =>
  history[0] ?? null

/** Euros spent on each day with refuels, most recent day first. */
export function dailySpending(history: RefuelHistory): DailySpending[] {
  const days: DailySpending[] = []
  for (const { date, euros } of history) {
    const last = days.at(-1)
    if (last?.date === date) last.euros += euros
    else days.push({ date, euros })
  }
  return days
}

/** Euros spent from the 1st of the current month up to today. */
export function monthTotal(history: RefuelHistory, today: IsoDate): number {
  const month = today.slice(0, 'AAAA-MM'.length)
  return history
    .filter(({ date }) => date.startsWith(month) && date <= today)
    .reduce((total, { euros }) => total + euros, 0)
}
