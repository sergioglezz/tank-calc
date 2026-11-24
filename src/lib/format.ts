const euros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

const wholeEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const liters = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatEuros = (amount: number): string => euros.format(amount)

export const formatWholeEuros = (amount: number): string =>
  wholeEuros.format(Math.trunc(amount))

export const formatLiters = (amount: number): string =>
  `${liters.format(amount)} l`
