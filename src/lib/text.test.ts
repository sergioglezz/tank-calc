import { describe, expect, it } from 'vitest'
import { normalizeText } from './text'

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
