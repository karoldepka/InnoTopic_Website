import {describe, expect, it} from 'vitest'
import {TimePointComponent} from './time-point.component'

describe('TimePointComponent', () => {
  it('formats a valid date as YYYY-MM-DD HH:MM:SS', () => {
    const component = new TimePointComponent()
    const result = component.process(new Date(2026, 0, 5, 9, 7, 3))
    expect(result).toBe('2026-01-05 09:07:03')
  })

  it('returns undefined (falls back to "(no timestamp)") for a genuinely invalid Date object rather than rendering NaN-NaN-NaN (GH #55)', () => {
    const component = new TimePointComponent()
    const invalidDate = new Date(NaN)
    expect(component.process(invalidDate)).toBeUndefined()
  })

  it('returns undefined for a missing time', () => {
    const component = new TimePointComponent()
    expect(component.process(undefined)).toBeUndefined()
  })

  it('hasValidTime is false for an invalid Date, true for a valid one, false when unset', () => {
    const component = new TimePointComponent()

    component.time = new Date(NaN)
    expect(component.hasValidTime).toBe(false)

    component.time = new Date(2026, 0, 5)
    expect(component.hasValidTime).toBe(true)

    component.time = undefined
    expect(component.hasValidTime).toBe(false)
  })
})
