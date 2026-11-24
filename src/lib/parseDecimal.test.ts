import { describe, expect, it } from 'vitest'
import { parseDecimal } from './parseDecimal'

describe('parseDecimal', () => {
  it('accepts a comma as decimal separator', () => {
    expect(parseDecimal('1,579')).toEqual({ value: 1.579, decimals: 3 })
  })

  it('accepts a dot as decimal separator', () => {
    expect(parseDecimal('1.579')).toEqual({ value: 1.579, decimals: 3 })
  })

  it('accepts integers', () => {
    expect(parseDecimal('50')).toEqual({ value: 50, decimals: 0 })
    expect(parseDecimal('0')).toEqual({ value: 0, decimals: 0 })
  })

  it('ignores leading and trailing spaces', () => {
    expect(parseDecimal('  42,5 ')).toEqual({ value: 42.5, decimals: 1 })
  })

  it('does not count trailing zeros as decimals', () => {
    expect(parseDecimal('1,50')).toEqual({ value: 1.5, decimals: 1 })
    expect(parseDecimal('50,0')).toEqual({ value: 50, decimals: 0 })
  })

  it.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['letters', 'abc'],
    ['mixed letters', '12a'],
    ['negative sign', '-3'],
    ['positive sign', '+3'],
    ['scientific notation', '1e3'],
    ['thousands separator', '1.000,5'],
    ['several separators', '1,2,3'],
    ['missing integer part', ',5'],
    ['missing decimal part', '5,'],
    ['inner spaces', '1 000'],
  ])('rejects %s', (_label, text) => {
    expect(parseDecimal(text)).toBeNull()
  })
})
