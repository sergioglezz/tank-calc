import { describe, expect, it } from 'vitest'
import { calculateFullTank } from './fillUp'

describe('calculateFullTank', () => {
  it('matches the reference example (CA7)', () => {
    expect(
      calculateFullTank({ capacity: 50, level: 25, price: 1.579 }),
    ).toEqual({ status: 'ok', liters: 37.5, exactCost: 59.21, wholeEuros: 59 })
  })

  it('reports a full tank at 100 % (CA10)', () => {
    expect(
      calculateFullTank({ capacity: 50, level: 100, price: 1.579 }),
    ).toEqual({ status: 'full' })
  })

  it('calculates normally with an empty tank (CA11)', () => {
    expect(calculateFullTank({ capacity: 40, level: 0, price: 1.5 })).toEqual({
      status: 'ok',
      liters: 40,
      exactCost: 60,
      wholeEuros: 60,
    })
  })

  it('never rounds the whole-euro amount up (CA8)', () => {
    // 9,603 l × 4,998 €/l = 47,995794 € → shown as 48,00 € but 47 € whole
    expect(
      calculateFullTank({ capacity: 9.7, level: 1, price: 4.998 }),
    ).toEqual({ status: 'ok', liters: 9.603, exactCost: 48, wholeEuros: 47 })
  })

  it('keeps exact whole-euro amounts where floating point would fail (CA9)', () => {
    // 11,2 × 0,75 × 2,5 is 20,999… in floating point; the real cost is 21 €
    expect(
      calculateFullTank({ capacity: 11.2, level: 25, price: 2.5 }),
    ).toEqual({ status: 'ok', liters: 8.4, exactCost: 21, wholeEuros: 21 })
  })

  it('returns 0 whole euros when less than 1 € is missing', () => {
    expect(calculateFullTank({ capacity: 50, level: 99, price: 1.5 })).toEqual({
      status: 'ok',
      liters: 0.5,
      exactCost: 0.75,
      wholeEuros: 0,
    })
  })

  it('returns finite numbers at the maximum values (CA12)', () => {
    const result = calculateFullTank({ capacity: 200, level: 0, price: 5 })
    expect(result).toEqual({
      status: 'ok',
      liters: 200,
      exactCost: 1000,
      wholeEuros: 1000,
    })
  })

  it('returns finite numbers at the minimum values (CA12)', () => {
    const result = calculateFullTank({ capacity: 0.1, level: 99, price: 0.001 })
    expect(result).toEqual({
      status: 'ok',
      liters: 0.001,
      exactCost: 0,
      wholeEuros: 0,
    })
  })
})
