import { describe, expect, it } from 'vitest'
import { daysBetween, isValidIsoDate, todayIso } from './dates'

describe('todayIso', () => {
  it('writes the local day as AAAA-MM-DD', () => {
    expect(todayIso(new Date(2026, 10, 24, 12, 0))).toBe('2026-11-24')
  })

  it('pads the month and the day', () => {
    expect(todayIso(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05')
  })

  it('uses the local day just after and just before midnight', () => {
    expect(todayIso(new Date(2026, 10, 24, 0, 30))).toBe('2026-11-24')
    expect(todayIso(new Date(2026, 10, 24, 23, 59))).toBe('2026-11-24')
  })
})

describe('isValidIsoDate', () => {
  it.each(['2026-11-24', '2026-01-01', '2026-12-31', '2028-02-29'])(
    'accepts %s',
    (text) => {
      expect(isValidIsoDate(text)).toBe(true)
    },
  )

  it.each([
    '2026-02-29',
    '2026-02-30',
    '2026-04-31',
    '2026-13-01',
    '2026-00-10',
    '2026-11-00',
    '2026-1-5',
    '24/11/2026',
    ' 2026-11-24',
    '',
    'hoy',
  ])('rejects %j', (text) => {
    expect(isValidIsoDate(text)).toBe(false)
  })
})

describe('daysBetween', () => {
  it.each([
    ['2026-11-24', '2026-11-24', 0],
    ['2026-11-01', '2026-11-24', 23],
    ['2026-10-31', '2026-11-01', 1],
    ['2025-12-31', '2026-01-01', 1],
    ['2025-11-24', '2026-11-24', 365],
    ['2027-11-24', '2028-11-24', 366],
    ['2028-02-28', '2028-03-01', 2],
    ['2026-11-24', '2026-11-20', -4],
  ])('from %s to %s is %d days', (from, to, expected) => {
    expect(daysBetween(from, to)).toBe(expected)
  })

  it('is not affected by daylight saving changes', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2)
  })
})
