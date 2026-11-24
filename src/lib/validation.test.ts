import { describe, expect, it } from 'vitest'
import { validateCapacity, validateLevel, validatePrice } from './validation'

const CAPACITY_EMPTY = 'Introduce la capacidad del depósito.'
const CAPACITY_INVALID =
  'Escribe una capacidad entre 0,1 y 200 litros, con un decimal como máximo.'
const LEVEL_EMPTY = 'Introduce el nivel actual.'
const LEVEL_INVALID = 'Escribe un porcentaje entero entre 0 y 100.'
const PRICE_EMPTY = 'Introduce el precio por litro.'
const PRICE_INVALID =
  'Escribe un precio entre 0,001 y 5 €/l, con tres decimales como máximo.'

describe('validateCapacity', () => {
  it.each([
    ['0,1', 0.1],
    ['50', 50],
    ['45,5', 45.5],
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

  it.each(['0', '0,0', '200,1', '201', '50,25', '-5', 'abc', '1.000,5'])(
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
