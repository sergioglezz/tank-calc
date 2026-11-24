import { describe, expect, it } from 'vitest'
import { evaluateCalculator, type CalculatorFields } from './calculatorForm'

const fields = (
  overrides: Partial<CalculatorFields> = {},
): CalculatorFields => ({
  level: '25',
  price: '1,579',
  target: '',
  money: '',
  ...overrides,
})

describe('evaluateCalculator', () => {
  it('calculates «A tope» with the spec example', () => {
    expect(evaluateCalculator(50, 'fullTank', fields()).result).toEqual({
      status: 'ok',
      euros: 59,
      liters: 37,
      finalLevel: 99,
      leftoverEuros: 0,
    })
  })

  it('calculates «Hasta X %» with the spec example', () => {
    const { result } = evaluateCalculator(
      50,
      'toLevel',
      fields({ target: '75' }),
    )
    expect(result).toEqual({
      status: 'ok',
      euros: 39,
      liters: 24,
      finalLevel: 74,
      leftoverEuros: 0,
    })
  })

  it('calculates «Tengo X €» with and without leftover money', () => {
    expect(
      evaluateCalculator(50, 'withMoney', fields({ money: '30' })).result,
    ).toEqual({
      status: 'ok',
      euros: 30,
      liters: 18,
      finalLevel: 62,
      leftoverEuros: 0,
    })
    expect(
      evaluateCalculator(50, 'withMoney', fields({ money: '80' })).result,
    ).toEqual({
      status: 'ok',
      euros: 59,
      liters: 37,
      finalLevel: 99,
      leftoverEuros: 21,
    })
  })

  it('gives less than one euro when what fits costs under 1 €', () => {
    const { result } = evaluateCalculator(
      50,
      'fullTank',
      fields({ level: '99', price: '1,5' }),
    )
    expect(result).toEqual({ status: 'lessThanOneEuro' })
  })

  it.each([
    ['empty level', { level: '' }],
    ['invalid level', { level: '105' }],
    ['empty price', { price: '' }],
    ['invalid price', { price: '5,001' }],
  ])('gives no result with an %s', (_, overrides) => {
    expect(evaluateCalculator(50, 'fullTank', fields(overrides)).result).toBe(
      null,
    )
  })

  it('needs the target in «Hasta X %» and the money in «Tengo X €»', () => {
    expect(evaluateCalculator(50, 'toLevel', fields()).result).toBe(null)
    expect(
      evaluateCalculator(50, 'toLevel', fields({ target: '101' })).result,
    ).toBe(null)
    expect(evaluateCalculator(50, 'withMoney', fields()).result).toBe(null)
    expect(
      evaluateCalculator(50, 'withMoney', fields({ money: '1.000' })).result,
    ).toEqual(expect.objectContaining({ euros: 1 }))
  })

  it('ignores the fields of other modes', () => {
    const { result } = evaluateCalculator(
      50,
      'fullTank',
      fields({ target: 'abc', money: '0' }),
    )
    expect(result).toEqual(expect.objectContaining({ euros: 59 }))
  })

  describe('with the level at 100 %', () => {
    it.each([
      ['fullTank', {}],
      ['toLevel', { target: '' }],
      ['toLevel', { target: '100' }],
      ['withMoney', { money: '' }],
      ['withMoney', { money: '5000' }],
      ['fullTank', { price: '' }],
      ['fullTank', { price: 'abc' }],
    ] as const)('says the tank is full in %s with %j', (mode, overrides) => {
      const { result } = evaluateCalculator(
        50,
        mode,
        fields({ level: '100', ...overrides }),
      )
      expect(result).toEqual({ status: 'full' })
    })

    it('still reports the target as not valid', () => {
      const { target } = evaluateCalculator(
        50,
        'toLevel',
        fields({ level: '100', target: '100' }),
      )
      expect(target).toEqual({
        ok: false,
        reason: 'invalid',
        message: 'El objetivo debe ser mayor que el nivel actual.',
      })
    })
  })

  describe('target validation', () => {
    it('compares the target with a valid current level', () => {
      const { target } = evaluateCalculator(
        50,
        'toLevel',
        fields({ level: '80', target: '75' }),
      )
      expect(target).toEqual({
        ok: false,
        reason: 'invalid',
        message: 'El objetivo debe ser mayor que el nivel actual.',
      })
    })

    it('only applies its own rule when the current level is not valid', () => {
      const { target } = evaluateCalculator(
        50,
        'toLevel',
        fields({ level: '105', target: '75' }),
      )
      expect(target).toEqual({ ok: true, value: 75 })
    })
  })

  it('always returns the result of every field', () => {
    const evaluation = evaluateCalculator(
      50,
      'fullTank',
      fields({ level: '', price: '1,579', target: '50', money: '' }),
    )
    expect(evaluation.level).toEqual({
      ok: false,
      reason: 'empty',
      message: 'Introduce el nivel actual.',
    })
    expect(evaluation.price).toEqual({ ok: true, value: 1.579 })
    expect(evaluation.target).toEqual({ ok: true, value: 50 })
    expect(evaluation.money).toEqual({
      ok: false,
      reason: 'empty',
      message: 'Introduce cuántos euros tienes.',
    })
  })
})
