export interface FullTankInput {
  /** Tank capacity in liters. */
  capacity: number
  /** Current level as an integer percentage (0–100). */
  level: number
  /** Price in euros per liter. */
  price: number
}

export type FullTankResult =
  | { status: 'full' }
  | { status: 'ok'; liters: number; exactCost: number; wholeEuros: number }

/**
 * Works in integers (deciliters × missing % × thousandths of a euro =
 * millionths of a euro) so truncating to whole euros is exact. See D1.
 */
export function calculateFullTank({
  capacity,
  level,
  price,
}: FullTankInput): FullTankResult {
  if (level === 100) return { status: 'full' }

  const capacityDeciliters = Math.round(capacity * 10)
  const missingPercent = 100 - level
  const priceThousandths = Math.round(price * 1000)
  const missingMilliliters = capacityDeciliters * missingPercent
  const microEuros = missingMilliliters * priceThousandths

  return {
    status: 'ok',
    liters: missingMilliliters / 1000,
    exactCost: Math.round(microEuros / 10_000) / 100,
    wholeEuros: Math.floor(microEuros / 1_000_000),
  }
}
