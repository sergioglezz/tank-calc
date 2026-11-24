export interface ParsedDecimal {
  value: number
  /** Significant decimal places, ignoring trailing zeros ("1,50" → 1). */
  decimals: number
}

const DECIMAL_PATTERN = /^(\d+)(?:[.,](\d+))?$/

export function parseDecimal(text: string): ParsedDecimal | null {
  const match = DECIMAL_PATTERN.exec(text.trim())
  if (!match) return null

  const integerPart = match[1]
  const fractionPart = (match[2] ?? '').replace(/0+$/, '')

  return {
    value: Number(`${integerPart}.${fractionPart || '0'}`),
    decimals: fractionPart.length,
  }
}
