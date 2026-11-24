import { describe, expect, it } from 'vitest'
import { formatEuros, formatLiters, formatWholeEuros } from './format'

// Intl separates the number and the unit with a non-breaking space.
const nbsp = ' '

describe('formatEuros', () => {
  it.each([
    [59.21, `59,21${nbsp}€`],
    [48, `48,00${nbsp}€`],
    [0.75, `0,75${nbsp}€`],
    [1000, `1000,00${nbsp}€`],
  ])('formats %d as %s', (amount, expected) => {
    expect(formatEuros(amount)).toBe(expected)
  })
})

describe('formatWholeEuros', () => {
  it.each([
    [59, `59${nbsp}€`],
    [0, `0${nbsp}€`],
    [1000, `1000${nbsp}€`],
  ])('formats %d as %s', (amount, expected) => {
    expect(formatWholeEuros(amount)).toBe(expected)
  })

  it('never rounds up', () => {
    expect(formatWholeEuros(47.99)).toBe(`47${nbsp}€`)
  })
})

describe('formatLiters', () => {
  it.each([
    [37.5, `37,50${nbsp}l`],
    [9.603, `9,60${nbsp}l`],
    [200, `200,00${nbsp}l`],
  ])('formats %d as %s', (amount, expected) => {
    expect(formatLiters(amount)).toBe(expected)
  })
})
