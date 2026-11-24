import { describe, expect, it } from 'vitest'
import {
  calculateFullTank,
  calculateToLevel,
  calculateWithMoney,
  litersForEuros,
  type TankInput,
} from './calculator'

const reference: TankInput = { capacity: 50, level: 25, price: 1.579 }
const full: TankInput = { ...reference, level: 100 }
const almostFull: TankInput = { capacity: 50, level: 99, price: 1.5 }

const ok = (
  euros: number,
  liters: number,
  finalLevel: number,
  leftoverEuros = 0,
) => ({ status: 'ok', euros, liters, finalLevel, leftoverEuros })

describe('calculateFullTank («A tope»)', () => {
  it('matches the reference example (CA10)', () => {
    expect(calculateFullTank(reference)).toEqual(ok(59, 37, 99))
  })

  it('fills an empty tank completely', () => {
    expect(calculateFullTank({ capacity: 40, level: 0, price: 1.5 })).toEqual(
      ok(60, 40, 100),
    )
  })

  it('reports a full tank at 100 % (CA16)', () => {
    expect(calculateFullTank(full)).toEqual({ status: 'full' })
  })

  it('reports less than 1 € (CA17)', () => {
    expect(calculateFullTank(almostFull)).toEqual({
      status: 'lessThanOneEuro',
    })
  })

  it('keeps exact whole euros where floating point would fail (CA8)', () => {
    // 50 × 1 × 1,14 is 56,999… in floating point; the real cost is 57 €
    expect(calculateFullTank({ capacity: 50, level: 0, price: 1.14 })).toEqual(
      ok(57, 50, 100),
    )
  })

  it('never rounds the euros up', () => {
    // 10 l × 96 % × 4,999 €/l = 47,99 € → 47 €
    expect(calculateFullTank({ capacity: 10, level: 4, price: 4.999 })).toEqual(
      ok(47, 9, 98),
    )
  })

  it('returns finite numbers at the maximum values (CA8)', () => {
    expect(calculateFullTank({ capacity: 200, level: 0, price: 5 })).toEqual(
      ok(1000, 200, 100),
    )
  })

  it('handles the minimum values (CA8)', () => {
    expect(calculateFullTank({ capacity: 1, level: 99, price: 0.001 })).toEqual(
      { status: 'lessThanOneEuro' },
    )
  })
})

describe('calculateToLevel («Hasta X %»)', () => {
  it('matches the reference example (CA12)', () => {
    expect(calculateToLevel(reference, 75)).toEqual(ok(39, 24, 74))
  })

  it('gives the same result as «A tope» with a 100 % target', () => {
    expect(calculateToLevel(reference, 100)).toEqual(
      calculateFullTank(reference),
    )
  })

  it('reaches the target exactly when the amount is a whole number', () => {
    expect(
      calculateToLevel({ capacity: 40, level: 0, price: 1.5 }, 50),
    ).toEqual(ok(30, 20, 50))
  })

  it('reports a full tank at 100 % (CA16)', () => {
    expect(calculateToLevel(full, 100)).toEqual({ status: 'full' })
  })

  it('reports less than 1 € (CA17)', () => {
    expect(calculateToLevel(almostFull, 100)).toEqual({
      status: 'lessThanOneEuro',
    })
  })
})

describe('calculateWithMoney («Tengo X €»)', () => {
  it('matches the reference example (CA14)', () => {
    expect(calculateWithMoney(reference, 30)).toEqual(ok(30, 18, 62))
  })

  it('caps the euros and reports the leftover (CA15)', () => {
    expect(calculateWithMoney(reference, 80)).toEqual(ok(59, 37, 99, 21))
  })

  it('has no leftover when the money equals the full-tank cost', () => {
    expect(calculateWithMoney(reference, 59)).toEqual(ok(59, 37, 99))
  })

  it('keeps exact whole liters where floating point would fail (CA8)', () => {
    // 28 € / 1,12 €/l is 24,999… in floating point; it is exactly 25 l
    expect(
      calculateWithMoney({ capacity: 50, level: 0, price: 1.12 }, 28),
    ).toEqual(ok(28, 25, 50))
  })

  it('shows 0 liters when 1 € buys less than a liter', () => {
    expect(calculateWithMoney({ capacity: 50, level: 0, price: 2 }, 1)).toEqual(
      ok(1, 0, 1),
    )
  })

  it('reports a full tank at 100 % (CA16)', () => {
    expect(calculateWithMoney(full, 30)).toEqual({ status: 'full' })
  })

  it('reports less than 1 € (CA17)', () => {
    expect(calculateWithMoney(almostFull, 30)).toEqual({
      status: 'lessThanOneEuro',
    })
  })

  it('returns finite numbers at the maximum values (CA8)', () => {
    expect(
      calculateWithMoney({ capacity: 200, level: 0, price: 5 }, 1000),
    ).toEqual(ok(1000, 200, 100))
  })
})

describe('litersForEuros', () => {
  it.each([
    [30, 1.579, 18],
    [28, 1.12, 25],
    [1, 2, 0],
    [1000, 0.001, 1_000_000],
  ])('%d € at %d €/l buy %d l', (euros, price, expected) => {
    expect(litersForEuros(euros, price)).toBe(expected)
  })
})
