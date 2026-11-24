import cars from './cars.json'
import { normalizeText } from './text'

export interface CatalogCar {
  brand: string
  model: string
  /** Only present when the model has tanks of different sizes. */
  variant?: string
  /** Tank capacity in whole liters. */
  capacity: number
}

/** Identifies a catalog car by its normalized names (D3). */
export const catalogKey = ({ brand, model, variant }: CatalogCar): string =>
  normalizeText([brand, model, variant ?? ''].join('|'))

export const catalogLabel = ({ brand, model, variant }: CatalogCar): string =>
  variant === undefined ? `${brand} ${model}` : `${brand} ${model} (${variant})`

const collator = new Intl.Collator('es')

function compareVariants(a?: string, b?: string): number {
  if (a === b) return 0
  if (a === undefined) return -1
  if (b === undefined) return 1
  return collator.compare(a, b)
}

const compareCatalogCars = (a: CatalogCar, b: CatalogCar): number =>
  collator.compare(a.brand, b.brand) ||
  collator.compare(a.model, b.model) ||
  compareVariants(a.variant, b.variant)

const catalogData: readonly CatalogCar[] = cars

/** Sorted by brand, model and variant; entries without variant go first. */
export const catalogCars: readonly CatalogCar[] = [...catalogData].sort(
  compareCatalogCars,
)

const carsByKey = new Map(catalogCars.map((car) => [catalogKey(car), car]))

export const findCatalogCar = (key: string): CatalogCar | null =>
  carsByKey.get(key) ?? null
