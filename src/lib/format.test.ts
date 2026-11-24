import { describe, expect, it } from 'vitest'
import {
  formatEuros,
  formatLiters,
  formatPercent,
  formatPriceInput,
} from './format'

// Number and unit are separated by a non-breaking space.
const nbsp = ' '

describe('formatEuros', () => {
  it.each([
    [59, `59${nbsp}€`],
    [1, `1${nbsp}€`],
    [1000, `1000${nbsp}€`],
  ])('formats %d as %s', (amount, expected) => {
    expect(formatEuros(amount)).toBe(expected)
  })
})

describe('formatLiters', () => {
  it.each([
    [37, `37${nbsp}l`],
    [0, `0${nbsp}l`],
    [200, `200${nbsp}l`],
  ])('formats %d as %s', (amount, expected) => {
    expect(formatLiters(amount)).toBe(expected)
  })
})

describe('formatPercent', () => {
  it.each([
    [99, `99${nbsp}%`],
    [0, `0${nbsp}%`],
    [100, `100${nbsp}%`],
  ])('formats %d as %s', (amount, expected) => {
    expect(formatPercent(amount)).toBe(expected)
  })
})

describe('whole numbers only', () => {
  it('never shows decimals or rounds up', () => {
    expect(formatEuros(47.99)).toBe(`47${nbsp}€`)
    expect(formatLiters(24.7)).toBe(`24${nbsp}l`)
    expect(formatPercent(74.9)).toBe(`74${nbsp}%`)
  })
})

describe('formatPriceInput', () => {
  it.each([
    [1.579, '1,579'],
    [1.5, '1,5'],
    [5, '5'],
    [0.001, '0,001'],
  ])('formats %d as %s', (price, expected) => {
    expect(formatPriceInput(price)).toBe(expected)
  })
})
