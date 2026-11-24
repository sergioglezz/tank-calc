/** A calendar day with no time, written as AAAA-MM-DD (D6). */
export type IsoDate = string

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const MS_PER_DAY = 86_400_000

const pad = (value: number, length: number): string =>
  String(value).padStart(length, '0')

/** The device's local day, so that 00:30 already counts as the new day. */
export const todayIso = (now: Date = new Date()): IsoDate =>
  `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1, 2)}-${pad(now.getDate(), 2)}`

/** UTC midnight of a valid date: no daylight saving changes in between. */
function toUtcTime(date: IsoDate): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** True when the text is AAAA-MM-DD and that day exists. */
export function isValidIsoDate(text: string): boolean {
  const match = ISO_DATE_PATTERN.exec(text)
  if (!match) return false
  const [, year, month, day] = match.map(Number)
  // Date.UTC rolls invalid days over (30 Feb → 2 Mar), so compare the parts.
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/** Calendar days from `from` to `to` (negative if `to` is earlier). */
export const daysBetween = (from: IsoDate, to: IsoDate): number =>
  Math.round((toUtcTime(to) - toUtcTime(from)) / MS_PER_DAY)

/** The day `days` calendar days after `date` (before, if negative). */
export function shiftDays(date: IsoDate, days: number): IsoDate {
  const shifted = new Date(toUtcTime(date) + days * MS_PER_DAY)
  return `${pad(shifted.getUTCFullYear(), 4)}-${pad(shifted.getUTCMonth() + 1, 2)}-${pad(shifted.getUTCDate(), 2)}`
}
