import type { IsoDate } from './dates'

// All results are whole numbers (CA18). Intl separates the number and the
// unit with a non-breaking space; the same space is used for liters and %.
const wholeNumber = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
})

const NBSP = ' '

const withUnit = (amount: number, unit: string): string =>
  `${wholeNumber.format(Math.trunc(amount))}${NBSP}${unit}`

export const formatEuros = (amount: number): string => withUnit(amount, '€')

export const formatLiters = (amount: number): string => withUnit(amount, 'l')

export const formatPercent = (amount: number): string => withUnit(amount, '%')

/**
 * A validated price written back for the input field: decimal comma and no
 * trailing zeros (1.579 → "1,579"). Valid prices (0.001–5, up to three
 * decimals) never use exponent notation in `String`.
 */
export const formatPriceInput = (price: number): string =>
  String(price).replace('.', ',')

/** A price per liter for display: 1.579 → "1,579 €/l". */
export const formatPrice = (price: number): string =>
  `${formatPriceInput(price)}${NBSP}€/l`

/** A calendar day for display: "2026-11-24" → "24/11/2026". */
export function formatDate(date: IsoDate): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}
