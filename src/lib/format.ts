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
