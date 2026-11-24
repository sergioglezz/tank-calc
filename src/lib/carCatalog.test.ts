import { describe, expect, it } from 'vitest'
import cars from './cars.json'
import {
  catalogCars,
  catalogKey,
  catalogLabel,
  findCatalogCar,
  type CatalogCar,
} from './carCatalog'
import { validateCapacity } from './validation'

const ALLOWED_FIELDS = ['brand', 'model', 'variant', 'capacity']

const isFilledText = (value: unknown): boolean =>
  typeof value === 'string' && value.trim() !== '' && value.trim() === value

describe('cars.json', () => {
  it('has between 90 and 110 entries', () => {
    expect(cars.length).toBeGreaterThanOrEqual(90)
    expect(cars.length).toBeLessThanOrEqual(110)
  })

  it.each(cars.map((car) => [catalogLabel(car), car]))(
    '%s has valid data',
    (_label, car) => {
      expect(
        Object.keys(car).every((key) => ALLOWED_FIELDS.includes(key)),
      ).toBe(true)
      expect(isFilledText(car.brand)).toBe(true)
      expect(isFilledText(car.model)).toBe(true)
      if (car.variant !== undefined)
        expect(isFilledText(car.variant)).toBe(true)
      expect(validateCapacity(String(car.capacity)).ok).toBe(true)
    },
  )

  it('has no two entries with the same brand, model and variant', () => {
    const keys = cars.map(catalogKey)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('only uses variants when the same model has tanks of different sizes', () => {
    const byModel = new Map<string, CatalogCar[]>()
    for (const car of cars) {
      const model = catalogKey({ ...car, variant: undefined })
      byModel.set(model, [...(byModel.get(model) ?? []), car])
    }
    for (const group of byModel.values()) {
      const capacities = group.map((car) => car.capacity)
      expect(new Set(capacities).size).toBe(capacities.length)
      if (group.length === 1) expect(group[0].variant).toBeUndefined()
    }
  })
})

describe('catalogKey', () => {
  it('joins the normalized brand, model and variant', () => {
    expect(
      catalogKey({
        brand: 'Seat',
        model: 'León',
        variant: 'Híbrido enchufable',
        capacity: 40,
      }),
    ).toBe('seat|leon|hibrido enchufable')
  })

  it('leaves the variant empty when there is none', () => {
    expect(
      catalogKey({ brand: 'Toyota', model: 'Corolla', capacity: 43 }),
    ).toBe('toyota|corolla|')
  })
})

describe('catalogLabel', () => {
  it('shows brand and model', () => {
    expect(
      catalogLabel({ brand: 'Toyota', model: 'Corolla', capacity: 43 }),
    ).toBe('Toyota Corolla')
  })

  it('adds the variant in brackets', () => {
    expect(
      catalogLabel({
        brand: 'Renault',
        model: 'Clio',
        variant: 'híbrido',
        capacity: 39,
      }),
    ).toBe('Renault Clio (híbrido)')
  })
})

describe('catalogCars', () => {
  it('contains every entry of cars.json', () => {
    expect(catalogCars).toHaveLength(cars.length)
  })

  it('is sorted by brand, model and variant, without variant first', () => {
    const labels = catalogCars.map(catalogLabel)
    expect(labels[0]).toBe('Audi A1')
    expect(labels.indexOf('Renault Clio')).toBe(
      labels.indexOf('Renault Clio (híbrido)') - 1,
    )
    expect(labels.indexOf('Hyundai Tucson (híbrido)')).toBe(
      labels.indexOf('Hyundai Tucson (híbrido enchufable)') - 1,
    )
    // Accented letters sort with their base letter: Citroën before Cupra.
    expect(labels.indexOf('Citroën C4')).toBeLessThan(
      labels.indexOf('Cupra Formentor'),
    )
  })

  it('places each entry after or at the same position as the previous one', () => {
    const collator = new Intl.Collator('es')
    for (let i = 1; i < catalogCars.length; i++) {
      const previous = catalogCars[i - 1]
      const current = catalogCars[i]
      const byBrand = collator.compare(previous.brand, current.brand)
      const byModel = collator.compare(previous.model, current.model)
      expect(byBrand < 0 || (byBrand === 0 && byModel <= 0)).toBe(true)
    }
  })
})

describe('findCatalogCar', () => {
  it('finds a car by its key', () => {
    expect(findCatalogCar('seat|leon|hibrido enchufable')).toEqual({
      brand: 'Seat',
      model: 'León',
      variant: 'híbrido enchufable',
      capacity: 40,
    })
  })

  it('returns null for an unknown key', () => {
    expect(findCatalogCar('tesla|model 3|')).toBeNull()
  })
})
