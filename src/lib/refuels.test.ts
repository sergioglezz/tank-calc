import { describe, expect, it } from 'vitest'
import { catalogCars, catalogKey, catalogLabel } from './carCatalog'
import { MAX_NAME_LENGTH, removeOwnCar, type CarState } from './ownCars'
import {
  addRefuel,
  dailySpending,
  lastRefuel,
  MAX_REFUELS,
  monthTotal,
  removeRefuel,
  sortRefuels,
  type AddRefuelResult,
  type Refuel,
  type RefuelHistory,
  type RefuelInput,
} from './refuels'

const TODAY = '2026-11-24'
const NO_CAR: CarState = { ownCars: [], selected: null }
const INPUT: RefuelInput = {
  eurosText: '30',
  priceText: '1,579',
  dateText: '',
}

const refuel = (id: number, date: string): Refuel => ({
  id,
  date,
  euros: 30,
  price: 1.579,
  liters: 18,
  car: null,
})

/** Freezes the history and its refuels to prove it is never mutated. */
const frozen = (history: Refuel[]): RefuelHistory =>
  Object.freeze(history.map((item) => Object.freeze(item)))

function saved(result: AddRefuelResult): RefuelHistory {
  if (!result.ok) throw new Error(JSON.stringify(result.errors))
  return result.history
}

const add = (
  history: RefuelHistory,
  input: Partial<RefuelInput> = {},
  cars: CarState = NO_CAR,
): RefuelHistory =>
  saved(addRefuel(history, { ...INPUT, ...input }, cars, TODAY))

describe('addRefuel', () => {
  it('saves a valid refuel with its liters and no car (CA1, CA3, CA7)', () => {
    expect(add([], { dateText: '2026-11-20' })).toEqual([
      {
        id: 1,
        date: '2026-11-20',
        euros: 30,
        price: 1.579,
        liters: 18,
        car: null,
      },
    ])
  })

  it('computes exact liters (CA3)', () => {
    const [saved28] = add([], { eurosText: '28', priceText: '1.12' })
    expect(saved28.liters).toBe(25)
  })

  it('saves 0 l when the price is very high', () => {
    const [saved1] = add([], { eurosText: '1', priceText: '2' })
    expect(saved1.liters).toBe(0)
  })

  it('reads the price with a comma or a dot (CA2)', () => {
    const [withDot] = add([], { priceText: ' 1.579 ' })
    expect(withDot.price).toBe(1.579)
  })

  it('uses today for an empty date (CA4)', () => {
    const [today] = add([], { dateText: '' })
    expect(today.date).toBe(TODAY)
  })

  it('accepts the valid extremes', () => {
    const history = add(add([], { eurosText: '1', priceText: '5' }), {
      eurosText: '1000',
      priceText: '0,001',
    })
    expect(history.map(({ euros, price }) => [euros, price])).toEqual([
      [1000, 0.001],
      [1, 5],
    ])
  })

  it('gives increasing ids', () => {
    const history = add(add(add([])))
    expect(history.map((item) => item.id)).toEqual([3, 2, 1])
  })

  describe('car (CA5)', () => {
    const catalogCar = catalogCars.find((car) => car.variant !== undefined)!

    it('saves the label of a selected catalog car', () => {
      const cars: CarState = {
        ownCars: [],
        selected: { source: 'catalog', key: catalogKey(catalogCar) },
      }
      const [withCar] = add([], {}, cars)
      expect(withCar.car).toBe(catalogLabel(catalogCar))
      expect(withCar.car).toMatch(/\(.+\)$/)
    })

    it('saves the name of a selected own car', () => {
      const cars: CarState = {
        ownCars: [{ name: 'Furgo', capacity: 70 }],
        selected: { source: 'own', name: 'FURGO' },
      }
      const [withCar] = add([], {}, cars)
      expect(withCar.car).toBe('Furgo')
    })

    it('saves no car when the selected one no longer exists', () => {
      const cars: CarState = {
        ownCars: [],
        selected: { source: 'own', name: 'Furgo' },
      }
      const [withoutCar] = add([], {}, cars)
      expect(withoutCar.car).toBeNull()
    })

    it('keeps the name after the car is deleted', () => {
      const cars: CarState = {
        ownCars: [{ name: 'Furgo', capacity: 70 }],
        selected: { source: 'own', name: 'Furgo' },
      }
      const history = add([], {}, cars)
      const carsAfter = removeOwnCar(cars, 'Furgo')
      expect(carsAfter.ownCars).toEqual([])
      expect(add(history, {}, carsAfter).map((item) => item.car)).toEqual([
        null,
        'Furgo',
      ])
    })

    it('fits every catalog label in the name limit used when loading', () => {
      for (const car of catalogCars) {
        expect([...catalogLabel(car)].length).toBeLessThanOrEqual(
          MAX_NAME_LENGTH,
        )
      }
    })
  })

  describe('validation (CA6)', () => {
    it('reports all the invalid data at once', () => {
      expect(
        addRefuel(
          [],
          { eurosText: '', priceText: '0', dateText: '2026-11-25' },
          NO_CAR,
          TODAY,
        ),
      ).toEqual({
        ok: false,
        errors: {
          euros: 'Introduce el importe pagado.',
          price:
            'Escribe un precio entre 0,001 y 5 €/l, con tres decimales como máximo.',
          date: 'La fecha no puede ser posterior a hoy.',
        },
      })
    })

    it.each([
      [
        { eurosText: '47,83' },
        { euros: 'Escribe un importe entero entre 1 y 1000 €.' },
      ],
      [{ priceText: '' }, { price: 'Introduce el precio por litro.' }],
      [{ dateText: '2026-02-30' }, { date: 'Introduce una fecha válida.' }],
      [
        { dateText: '2025-11-23' },
        { date: 'La fecha no puede ser de hace más de un año.' },
      ],
    ])('reports only the invalid field for %j', (input, errors) => {
      expect(addRefuel([], { ...INPUT, ...input }, NO_CAR, TODAY)).toEqual({
        ok: false,
        errors,
      })
    })

    it('does not save anything when the data is invalid', () => {
      const history = frozen([refuel(1, '2026-11-20')])
      const result = addRefuel(
        history,
        { ...INPUT, eurosText: '0' },
        NO_CAR,
        TODAY,
      )
      expect(result.ok).toBe(false)
      expect(history).toHaveLength(1)
    })
  })

  describe('order (CA10)', () => {
    it('keeps the most recent date first and, on the same day, the last saved', () => {
      let history = add([], { dateText: '2026-11-20' })
      history = add(history, { dateText: '2026-11-24' })
      history = add(history, { dateText: '2026-11-20' })
      history = add(history, { dateText: '2026-10-01' })
      expect(history.map(({ id, date }) => [id, date])).toEqual([
        [2, '2026-11-24'],
        [3, '2026-11-20'],
        [1, '2026-11-20'],
        [4, '2026-10-01'],
      ])
    })
  })

  describe('limit of 500 (CA8)', () => {
    // 2026-01-01 … spread over the year, several per day.
    const fullHistory = (count: number): RefuelHistory =>
      sortRefuels(
        Array.from({ length: count }, (_, i) => {
          const day = String((i % 28) + 1).padStart(2, '0')
          const month = String(Math.floor(i / 50) + 1).padStart(2, '0')
          return refuel(i + 1, `2026-${month}-${day}`)
        }),
      )

    it('saves the 500th without dropping anything', () => {
      const history = add(fullHistory(MAX_REFUELS - 1))
      expect(history).toHaveLength(MAX_REFUELS)
    })

    it('drops the oldest one, the first saved that day, when saving the 501st', () => {
      const before = fullHistory(MAX_REFUELS)
      const oldest = before.at(-1)!
      expect(
        before.filter((item) => item.date === oldest.date).length,
      ).toBeGreaterThan(1)

      const history = add(before)
      expect(history).toHaveLength(MAX_REFUELS)
      expect(history).not.toContainEqual(oldest)
      expect(history[0]).toMatchObject({ id: MAX_REFUELS + 1, date: TODAY })
    })

    it('keeps the new one even if it is older than all the others', () => {
      const before = fullHistory(MAX_REFUELS)
      const oldest = before.at(-1)!
      const history = add(before, { dateText: '2025-12-01' })
      expect(history).toHaveLength(MAX_REFUELS)
      expect(history).not.toContainEqual(oldest)
      expect(history.at(-1)).toMatchObject({
        id: MAX_REFUELS + 1,
        date: '2025-12-01',
      })
    })
  })

  it('does not modify the history it receives', () => {
    const history = frozen([refuel(2, '2026-11-20'), refuel(1, '2026-11-10')])
    const copy = structuredClone(history)
    add(history)
    expect(history).toEqual(copy)
  })
})

describe('sortRefuels', () => {
  it('sorts by date and then by id, newest first, without mutating', () => {
    const history = frozen([
      refuel(1, '2026-11-20'),
      refuel(3, '2026-11-01'),
      refuel(2, '2026-11-20'),
    ])
    expect(sortRefuels(history).map((item) => item.id)).toEqual([2, 1, 3])
  })
})

const spent = (id: number, date: string, euros: number): Refuel => ({
  ...refuel(id, date),
  euros,
})

describe('removeRefuel (CA9)', () => {
  it('removes only the chosen one of two identical refuels', () => {
    const history = frozen([refuel(2, '2026-11-20'), refuel(1, '2026-11-20')])
    expect(removeRefuel(history, 1)).toEqual([refuel(2, '2026-11-20')])
    expect(history).toHaveLength(2)
  })

  it('changes nothing with an unknown id', () => {
    const history = frozen([refuel(1, '2026-11-20')])
    expect(removeRefuel(history, 7)).toEqual(history)
  })

  it('leaves an empty history after removing the last one', () => {
    const history = removeRefuel(frozen([refuel(1, '2026-11-20')]), 1)
    expect(history).toEqual([])
    expect(lastRefuel(history)).toBeNull()
    expect(dailySpending(history)).toEqual([])
    expect(monthTotal(history, TODAY)).toBe(0)
  })

  it('lets the next refuel reuse the id of the last one removed', () => {
    const history = removeRefuel(add(add([])), 2)
    expect(add(history).map((item) => item.id)).toEqual([2, 1])
  })
})

describe('lastRefuel (CA11)', () => {
  it('is null with an empty history', () => {
    expect(lastRefuel([])).toBeNull()
  })

  it('is the most recent date, the last saved that day', () => {
    let history = add([], { dateText: '2026-11-24', eurosText: '40' })
    history = add(history, { dateText: '2026-11-24', eurosText: '20' })
    history = add(history, { dateText: '2026-11-10', eurosText: '60' })
    expect(lastRefuel(history)).toEqual({
      id: 2,
      date: '2026-11-24',
      euros: 20,
      price: 1.579,
      liters: 12,
      car: null,
    })
  })
})

describe('dailySpending (CA12)', () => {
  it('adds up the refuels of each day, most recent day first', () => {
    const history = frozen([
      spent(4, '2026-11-24', 20),
      spent(3, '2026-11-24', 35),
      spent(2, '2026-11-10', 60),
      spent(1, '2026-10-31', 45),
    ])
    expect(dailySpending(history)).toEqual([
      { date: '2026-11-24', euros: 55 },
      { date: '2026-11-10', euros: 60 },
      { date: '2026-10-31', euros: 45 },
    ])
  })

  it('is empty with an empty history', () => {
    expect(dailySpending([])).toEqual([])
  })

  it('does not modify the history', () => {
    const history = frozen([
      spent(2, '2026-11-24', 20),
      spent(1, '2026-11-24', 30),
    ])
    dailySpending(history)
    expect(history.map((item) => item.euros)).toEqual([20, 30])
  })
})

describe('monthTotal (CA13)', () => {
  const history = frozen([
    spent(6, '2026-11-30', 70),
    spent(5, '2026-11-24', 20),
    spent(4, '2026-11-10', 60),
    spent(3, '2026-11-01', 15),
    spent(2, '2026-10-31', 45),
    spent(1, '2025-11-15', 50),
  ])

  // Leaves out a date after today, the previous month and another year.
  it('adds up the euros from the 1st of the month to today', () => {
    expect(monthTotal(history, TODAY)).toBe(20 + 60 + 15)
  })

  it('only counts the 1st on the 1st of the month', () => {
    expect(monthTotal(history, '2026-11-01')).toBe(15)
  })

  it('is 0 without refuels this month', () => {
    expect(monthTotal(history, '2026-12-05')).toBe(0)
    expect(monthTotal([], TODAY)).toBe(0)
  })
})
