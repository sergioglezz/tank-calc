import { daysBetween, isValidIsoDate, type IsoDate } from './dates'
import { parseDecimal, type ParsedDecimal } from './parseDecimal'

export type FieldResult<T = number> =
  | { ok: true; value: T }
  | { ok: false; reason: 'empty' | 'invalid'; message: string }

interface FieldRule {
  isValid: (parsed: ParsedDecimal) => boolean
  emptyMessage: string
  invalidMessage: string
}

function validateField(text: string, rule: FieldRule): FieldResult {
  if (text.trim() === '') {
    return { ok: false, reason: 'empty', message: rule.emptyMessage }
  }
  const parsed = parseDecimal(text)
  if (parsed === null || !rule.isValid(parsed)) {
    return { ok: false, reason: 'invalid', message: rule.invalidMessage }
  }
  return { ok: true, value: parsed.value }
}

const MAX_CAPACITY_LITERS = 200
const MAX_PRICE_PER_LITER = 5
const MAX_MONEY_EUROS = 1000

const isIntegerBetween =
  (min: number, max: number) =>
  ({ value, decimals }: ParsedDecimal): boolean =>
    decimals === 0 && value >= min && value <= max

const capacityRule: FieldRule = {
  isValid: isIntegerBetween(1, MAX_CAPACITY_LITERS),
  emptyMessage: 'Introduce la capacidad del depósito.',
  invalidMessage: 'Escribe una capacidad entera entre 1 y 200 litros.',
}

const levelRule: FieldRule = {
  isValid: isIntegerBetween(0, 100),
  emptyMessage: 'Introduce el nivel actual.',
  invalidMessage: 'Escribe un porcentaje entero entre 0 y 100.',
}

const priceRule: FieldRule = {
  isValid: ({ value, decimals }) =>
    value > 0 && value <= MAX_PRICE_PER_LITER && decimals <= 3,
  emptyMessage: 'Introduce el precio por litro.',
  invalidMessage:
    'Escribe un precio entre 0,001 y 5 €/l, con tres decimales como máximo.',
}

const targetLevelRule: FieldRule = {
  isValid: isIntegerBetween(1, 100),
  emptyMessage: 'Introduce el nivel al que quieres llegar.',
  invalidMessage: 'Escribe un porcentaje entero entre 1 y 100.',
}

const moneyRule: FieldRule = {
  isValid: isIntegerBetween(1, MAX_MONEY_EUROS),
  emptyMessage: 'Introduce cuántos euros tienes.',
  invalidMessage: 'Escribe un importe entero entre 1 y 1000 €.',
}

const paidEurosRule: FieldRule = {
  ...moneyRule,
  emptyMessage: 'Introduce el importe pagado.',
}

const TARGET_NOT_ABOVE_LEVEL = 'El objetivo debe ser mayor que el nivel actual.'

export const validateCapacity = (text: string): FieldResult =>
  validateField(text, capacityRule)

export const validateLevel = (text: string): FieldResult =>
  validateField(text, levelRule)

export const validatePrice = (text: string): FieldResult =>
  validateField(text, priceRule)

/**
 * `currentLevel` is the validated current level, or `null` when it is not
 * valid yet; in that case only the target's own rule applies.
 */
export function validateTargetLevel(
  text: string,
  currentLevel: number | null,
): FieldResult {
  const result = validateField(text, targetLevelRule)
  if (result.ok && currentLevel !== null && result.value <= currentLevel) {
    return { ok: false, reason: 'invalid', message: TARGET_NOT_ABOVE_LEVEL }
  }
  return result
}

export const validateMoney = (text: string): FieldResult =>
  validateField(text, moneyRule)

export const validatePaidEuros = (text: string): FieldResult =>
  validateField(text, paidEurosRule)

/** How many days before today a refuel can be dated (CA4 of spec 003). */
export const MAX_REFUEL_AGE_DAYS = 365

const invalidDate = (message: string): FieldResult<IsoDate> => ({
  ok: false,
  reason: 'invalid',
  message,
})

/** An empty date means `today`; otherwise, a day from the last 365 days. */
export function validateRefuelDate(
  text: string,
  today: IsoDate,
): FieldResult<IsoDate> {
  const date = text.trim()
  if (date === '') return { ok: true, value: today }
  if (!isValidIsoDate(date)) return invalidDate('Introduce una fecha válida.')
  // AAAA-MM-DD dates compare correctly as text (D6).
  if (date > today) {
    return invalidDate('La fecha no puede ser posterior a hoy.')
  }
  if (daysBetween(date, today) > MAX_REFUEL_AGE_DAYS) {
    return invalidDate('La fecha no puede ser de hace más de un año.')
  }
  return { ok: true, value: date }
}
