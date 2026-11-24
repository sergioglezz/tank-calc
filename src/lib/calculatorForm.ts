import {
  calculateFullTank,
  calculateToLevel,
  calculateWithMoney,
  type CalculationResult,
} from './calculator'
import {
  validateLevel,
  validateMoney,
  validatePrice,
  validateTargetLevel,
  type FieldResult,
} from './validation'

export type Mode = 'fullTank' | 'toLevel' | 'withMoney'

/** What the user typed in the calculator, always as text. */
export interface CalculatorFields {
  level: string
  price: string
  target: string
  money: string
}

export interface CalculatorEvaluation {
  level: FieldResult
  price: FieldResult
  target: FieldResult
  money: FieldResult
  /** null while a field the mode needs is empty or not valid. */
  result: CalculationResult | null
}

type Validated = Omit<CalculatorEvaluation, 'result'>

function calculate(
  capacity: number,
  mode: Mode,
  { level, price, target, money }: Validated,
): CalculationResult | null {
  if (!level.ok) return null
  // A full tank needs nothing else, in any mode (CA8 of spec 004).
  if (level.value === 100) return { status: 'full' }
  if (!price.ok) return null

  const input = { capacity, level: level.value, price: price.value }
  switch (mode) {
    case 'fullTank':
      return calculateFullTank(input)
    case 'toLevel':
      return target.ok ? calculateToLevel(input, target.value) : null
    case 'withMoney':
      return money.ok ? calculateWithMoney(input, money.value) : null
  }
}

/**
 * Validates every field and calculates the result for the selected car's
 * capacity. Which errors are shown is up to the interface.
 */
export function evaluateCalculator(
  capacity: number,
  mode: Mode,
  fields: CalculatorFields,
): CalculatorEvaluation {
  const level = validateLevel(fields.level)
  const validated: Validated = {
    level,
    price: validatePrice(fields.price),
    // With an invalid level only the target's own rule applies (CA13).
    target: validateTargetLevel(fields.target, level.ok ? level.value : null),
    money: validateMoney(fields.money),
  }
  return { ...validated, result: calculate(capacity, mode, validated) }
}
