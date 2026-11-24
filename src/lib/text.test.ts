import { describe, expect, it } from 'vitest'
import { digitsOnly, normalizeText } from './text'

describe('normalizeText', () => {
  it.each([
    ['LEON', 'leon'],
    ['León', 'leon'],
    ['Citroën', 'citroen'],
    ['ÁÉÍÓÚ àèìòù', 'aeiou aeiou'],
    ['Toyota Corolla', 'toyota corolla'],
  ])('normalizes %s as %s', (text, expected) => {
    expect(normalizeText(text)).toBe(expected)
  })

  it('leaves plain lowercase text unchanged', () => {
    expect(normalizeText('mi coche 2')).toBe('mi coche 2')
  })

  it('treats precomposed and decomposed accents the same', () => {
    expect(normalizeText('León')).toBe(normalizeText('León'))
  })
})

describe('digitsOnly', () => {
  it.each([
    ['1.000', '1000'],
    ['40,5', '405'],
    ['-3', '3'],
    [' 1e3 ', '13'],
    ['50 €', '50'],
    ['abc', ''],
    ['', ''],
    ['0123', '0123'],
  ])('keeps only the digits of %j', (text, expected) => {
    expect(digitsOnly(text)).toBe(expected)
  })

  it('drops non-ASCII digits', () => {
    expect(digitsOnly('１２')).toBe('')
  })
})
