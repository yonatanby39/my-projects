import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, fromDateKey, toDateKey } from './date'

describe('date keys', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('round-trips through fromDateKey', () => {
    expect(toDateKey(fromDateKey('2026-11-26'))).toBe('2026-11-26')
  })

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('counts days between keys', () => {
    expect(daysBetween('2026-11-26', '2026-11-27')).toBe(1)
    expect(daysBetween('2026-11-26', '2026-11-26')).toBe(0)
    expect(daysBetween('2026-11-27', '2026-11-26')).toBe(-1)
  })
})
