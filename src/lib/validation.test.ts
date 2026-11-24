import { describe, expect, it } from 'vitest'
import {
  validateCapacity,
  validateLevel,
  validateMoney,
  validatePaidEuros,
  validatePrice,
  validateRefuelDate,
  validateTargetLevel,
} from './validation'

const CAPACITY_EMPTY = 'Introduce la capacidad del depósito.'
const CAPACITY_INVALID = 'Escribe una capacidad entera entre 1 y 200 litros.'
const LEVEL_EMPTY = 'Introduce el nivel actual.'
const LEVEL_INVALID = 'Escribe un porcentaje entero entre 0 y 100.'
const PRICE_EMPTY = 'Introduce el precio por litro.'
const PRICE_INVALID =
  'Escribe un precio entre 0,001 y 5 €/l, con tres decimales como máximo.'
const TARGET_EMPTY = 'Introduce el nivel al que quieres llegar.'
const TARGET_INVALID = 'Escribe un porcentaje entero entre 1 y 100.'
const TARGET_NOT_ABOVE = 'El objetivo debe ser mayor que el nivel actual.'
const MONEY_EMPTY = 'Introduce cuántos euros tienes.'
const MONEY_INVALID = 'Escribe un importe entero entre 1 y 1000 €.'
const PAID_EMPTY = 'Introduce el importe pagado.'
const DATE_INVALID = 'Introduce una fecha válida.'
const DATE_FUTURE = 'La fecha no puede ser posterior a hoy.'
const DATE_TOO_OLD = 'La fecha no puede ser de hace más de un año.'

describe('validateCapacity', () => {
  it.each([
    ['1', 1],
    ['50', 50],
    ['40,0', 40],
    ['200', 200],
    [' 60.0 ', 60],
  ])('accepts %s', (text, value) => {
    expect(validateCapacity(text)).toEqual({ ok: true, value })
  })

  it.each(['', '   '])('reports empty input %j', (text) => {
    expect(validateCapacity(text)).toEqual({
      ok: false,
      reason: 'empty',
      message: CAPACITY_EMPTY,
    })
  })

  it.each(['0', '0,0', '0,1', '40,5', '200,1', '201', '-5', 'abc', '1.000,5'])(
    'rejects %s',
    (text) => {
      expect(validateCapacity(text)).toEqual({
        ok: false,
        reason: 'invalid',
        message: CAPACITY_INVALID,
      })
    },
  )
})

describe('validateLevel', () => {
  it.each([
    ['0', 0],
    ['25', 25],
    ['100', 100],
    ['50,0', 50],
  ])('accepts %s', (text, value) => {
    expect(validateLevel(text)).toEqual({ ok: true, value })
  })

  it('reports empty input', () => {
    expect(validateLevel('')).toEqual({
      ok: false,
      reason: 'empty',
      message: LEVEL_EMPTY,
    })
  })

  it.each(['-1', '101', '50,5', '100,1', 'lleno'])('rejects %s', (text) => {
    expect(validateLevel(text)).toEqual({
      ok: false,
      reason: 'invalid',
      message: LEVEL_INVALID,
    })
  })
})

describe('validatePrice', () => {
  it.each([
    ['0,001', 0.001],
    ['1,579', 1.579],
    ['1.579', 1.579],
    ['1,5790', 1.579],
    ['5', 5],
  ])('accepts %s', (text, value) => {
    expect(validatePrice(text)).toEqual({ ok: true, value })
  })

  it('reports empty input', () => {
    expect(validatePrice('')).toEqual({
      ok: false,
      reason: 'empty',
      message: PRICE_EMPTY,
    })
  })

  it.each(['0', '0,000', '5,001', '1579', '1,5799', '-1,5', '1e0'])(
    'rejects %s',
    (text) => {
      expect(validatePrice(text)).toEqual({
        ok: false,
        reason: 'invalid',
        message: PRICE_INVALID,
      })
    },
  )
})

describe('validateTargetLevel', () => {
  it.each([
    ['1', 1],
    ['75', 75],
    ['100', 100],
    ['75,0', 75],
  ])('accepts %s with no valid current level', (text, value) => {
    expect(validateTargetLevel(text, null)).toEqual({ ok: true, value })
  })

  it('accepts a target above the current level', () => {
    expect(validateTargetLevel('75', 25)).toEqual({ ok: true, value: 75 })
  })

  it('reports empty input', () => {
    expect(validateTargetLevel(' ', 25)).toEqual({
      ok: false,
      reason: 'empty',
      message: TARGET_EMPTY,
    })
  })

  it.each(['0', '101', '75,5', '-10', 'mitad'])('rejects %s', (text) => {
    expect(validateTargetLevel(text, null)).toEqual({
      ok: false,
      reason: 'invalid',
      message: TARGET_INVALID,
    })
  })

  it.each([
    ['25', 25],
    ['20', 25],
    ['100', 100],
  ])('rejects target %s with current level %d (CA6)', (text, level) => {
    expect(validateTargetLevel(text, level)).toEqual({
      ok: false,
      reason: 'invalid',
      message: TARGET_NOT_ABOVE,
    })
  })

  it('reports its own rule before comparing with the current level', () => {
    expect(validateTargetLevel('101', 25)).toEqual({
      ok: false,
      reason: 'invalid',
      message: TARGET_INVALID,
    })
  })
})

describe('validateMoney', () => {
  it.each([
    ['1', 1],
    ['30', 30],
    ['1000', 1000],
    ['20,0', 20],
  ])('accepts %s', (text, value) => {
    expect(validateMoney(text)).toEqual({ ok: true, value })
  })

  it('reports empty input', () => {
    expect(validateMoney('')).toEqual({
      ok: false,
      reason: 'empty',
      message: MONEY_EMPTY,
    })
  })

  it.each(['0', '1001', '20,5', '-5', '1.000,5', 'veinte'])(
    'rejects %s',
    (text) => {
      expect(validateMoney(text)).toEqual({
        ok: false,
        reason: 'invalid',
        message: MONEY_INVALID,
      })
    },
  )
})

describe('validatePaidEuros', () => {
  it.each([
    ['1', 1],
    ['59', 59],
    ['1000', 1000],
    [' 30 ', 30],
    ['20,0', 20],
  ])('accepts %s', (text, value) => {
    expect(validatePaidEuros(text)).toEqual({ ok: true, value })
  })

  it.each(['', '   '])('reports empty input %j', (text) => {
    expect(validatePaidEuros(text)).toEqual({
      ok: false,
      reason: 'empty',
      message: PAID_EMPTY,
    })
  })

  it.each(['0', '1001', '20,5', '47,83', '-5', '1.000,5', 'veinte'])(
    'rejects %s with the message of feature 001',
    (text) => {
      expect(validatePaidEuros(text)).toEqual({
        ok: false,
        reason: 'invalid',
        message: MONEY_INVALID,
      })
    },
  )
})

describe('validateRefuelDate', () => {
  const today = '2026-11-24'

  it.each(['', '   '])('uses today for an empty date %j', (text) => {
    expect(validateRefuelDate(text, today)).toEqual({ ok: true, value: today })
  })

  it.each([
    ['2026-11-24', '2026-11-24'],
    ['2026-11-23', '2026-11-23'],
    ['2025-11-24', '2025-11-24'],
    [' 2026-01-05 ', '2026-01-05'],
  ])('accepts %j', (text, value) => {
    expect(validateRefuelDate(text, today)).toEqual({ ok: true, value })
  })

  it.each(['2026-02-30', '2026-13-01', '2026-1-5', '24/11/2026', 'ayer'])(
    'rejects the malformed or missing date %j',
    (text) => {
      expect(validateRefuelDate(text, today)).toEqual({
        ok: false,
        reason: 'invalid',
        message: DATE_INVALID,
      })
    },
  )

  it.each(['2026-11-25', '2027-01-01'])(
    'rejects the future date %s',
    (text) => {
      expect(validateRefuelDate(text, today)).toEqual({
        ok: false,
        reason: 'invalid',
        message: DATE_FUTURE,
      })
    },
  )

  it.each(['2025-11-23', '2020-01-01'])(
    'rejects %s, more than 365 days ago',
    (text) => {
      expect(validateRefuelDate(text, today)).toEqual({
        ok: false,
        reason: 'invalid',
        message: DATE_TOO_OLD,
      })
    },
  )

  it('counts 365 days back across a leap day', () => {
    expect(validateRefuelDate('2028-03-01', '2029-03-01').ok).toBe(true)
    expect(validateRefuelDate('2028-02-29', '2029-03-01').ok).toBe(false)
  })
})
