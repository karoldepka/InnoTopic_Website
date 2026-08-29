import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {QuizTrackingService} from './quiz-tracking.service'

describe('QuizTrackingService visibility tracking', () => {
  let hidden = false
  let originalHiddenDescriptor: PropertyDescriptor | undefined

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-29T08:00:00Z'))
    originalHiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden')
    Object.defineProperty(document, 'hidden', {configurable: true, get: () => hidden})
  })

  afterEach(() => {
    vi.useRealTimers()
    if (originalHiddenDescriptor) {
      Object.defineProperty(document, 'hidden', originalHiddenDescriptor)
    } else {
      delete (document as any).hidden
    }
  })

  it('pauses while hidden, resumes when visible, and excludes hidden time from the item duration', async () => {
    const entry = {
      startOrResumeTrackingIfNeeded: vi.fn(),
      pauseOrNoop: vi.fn(),
    }
    const service = new QuizTrackingService(
      {} as any,
      {} as any,
      {} as any,
      {recordCompletedPeriodForItem: vi.fn()} as any,
      {userId: 'user-1'} as any,
    )
    ;(service as any).entry = entry

    await service.startTracking()
    service.startQuestionTiming()
    vi.advanceTimersByTime(30_000)

    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(entry.pauseOrNoop).toHaveBeenCalled()

    vi.advanceTimersByTime(60 * 60_000)
    expect(service.getCurrentQuestionActiveDurationMs()).toBe(30_000)

    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(10_000)

    expect(entry.startOrResumeTrackingIfNeeded).toHaveBeenCalledTimes(2)
    expect(service.getCurrentQuestionActiveDurationMs()).toBe(40_000)

    service.ngOnDestroy()
  })
})
