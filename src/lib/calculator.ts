export interface TankInput {
  /** Tank capacity in whole liters (1–200). */
  capacity: number
  /** Current level as an integer percentage (0–100). */
  level: number
  /** Price in euros per liter, with up to three decimals. */
  price: number
}

export type CalculationResult =
  | { status: 'full' }
  | { status: 'lessThanOneEuro' }
  | {
      status: 'ok'
      /** Whole euros to ask for at the till, never rounded up. */
      euros: number
      /** Whole liters those euros buy, rounded down. */
      liters: number
      /** Integer percentage the tank reaches, rounded down. */
      finalLevel: number
      /** Whole euros left over (only in «Tengo X €»; otherwise 0). */
      leftoverEuros: number
    }

/*
 * Everything is computed with integers so that truncating is exact (D1):
 * whole liters × percentage points × thousandths of a euro.
 */
const toThousandths = (price: number): number => Math.round(price * 1000)

/** Whole liters that `euros` whole euros buy at `price` €/l, truncated. */
export const litersForEuros = (euros: number, price: number): number =>
  Math.floor((euros * 1000) / toThousandths(price))

/** Whole euros it costs to go from the current level to `target`, truncated. */
function costToReach({ capacity, level, price }: TankInput, target: number) {
  return Math.floor(
    (capacity * (target - level) * toThousandths(price)) / 100_000,
  )
}

function resultForEuros(
  { capacity, level, price }: TankInput,
  euros: number,
  leftoverEuros = 0,
): CalculationResult {
  if (euros === 0) return { status: 'lessThanOneEuro' }

  return {
    status: 'ok',
    euros,
    liters: litersForEuros(euros, price),
    finalLevel:
      level + Math.floor((euros * 100_000) / (toThousandths(price) * capacity)),
    leftoverEuros,
  }
}

/** «A tope»: fill the tank. */
export function calculateFullTank(input: TankInput): CalculationResult {
  if (input.level === 100) return { status: 'full' }
  return resultForEuros(input, costToReach(input, 100))
}

/** «Hasta X %»: reach `target` (already validated to be above the level). */
export function calculateToLevel(
  input: TankInput,
  target: number,
): CalculationResult {
  if (input.level === 100) return { status: 'full' }
  return resultForEuros(input, costToReach(input, target))
}

/** «Tengo X €»: spend up to `money` whole euros without overfilling. */
export function calculateWithMoney(
  input: TankInput,
  money: number,
): CalculationResult {
  if (input.level === 100) return { status: 'full' }
  const fullTankEuros = costToReach(input, 100)
  return resultForEuros(
    input,
    Math.min(money, fullTankEuros),
    Math.max(0, money - fullTankEuros),
  )
}
