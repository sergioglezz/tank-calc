import { parseDecimal, type ParsedDecimal } from './parseDecimal'

export type FieldResult =
  | { ok: true; value: number }
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

const capacityRule: FieldRule = {
  isValid: ({ value, decimals }) =>
    value > 0 && value <= MAX_CAPACITY_LITERS && decimals <= 1,
  emptyMessage: 'Introduce la capacidad del depósito.',
  invalidMessage:
    'Escribe una capacidad entre 0,1 y 200 litros, con un decimal como máximo.',
}

const levelRule: FieldRule = {
  isValid: ({ value, decimals }) => value <= 100 && decimals === 0,
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

export const validateCapacity = (text: string): FieldResult =>
  validateField(text, capacityRule)

export const validateLevel = (text: string): FieldResult =>
  validateField(text, levelRule)

export const validatePrice = (text: string): FieldResult =>
  validateField(text, priceRule)
