import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms'
import {ViewSyncer} from './ViewSyncer'
import {CachedSubject} from '../../utils/cachedSubject2/CachedSubject2'
import {PatchableObservable} from '../../utils/rxUtils'

interface SutData {
  general?: string
}

function setup() {
  const locallyVisibleChanges$ = new CachedSubject<SutData | undefined | null>()
  const item$: PatchableObservable<SutData> = {
    locallyVisibleChanges$: locallyVisibleChanges$ as any,
    patchThrottled: vi.fn(),
  }
  const formControl = new UntypedFormControl()
  const formGroup = new UntypedFormGroup({general: formControl})
  const viewSyncer = new ViewSyncer(formGroup, item$, true, 'general')
  return {viewSyncer, formControl, locallyVisibleChanges$}
}

describe('ViewSyncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies the first incoming DB value immediately', () => {
    const {formControl, locallyVisibleChanges$} = setup()

    locallyVisibleChanges$.nextWithCache({general: 'A'})

    // fieldNameHack is set, so plain text gets marked as HTML on the way in (convertToHtmlIfNeeded) -
    // unrelated to this test's point, just how the real Journal usage (rich text fields) works.
    expect(formControl.value).toBe('<p></p>A')
  })

  it('GH #83: a genuinely newer DB value arriving during the post-edit lockout is retried ' +
    'and applied once the lockout lifts, instead of being silently dropped forever', () => {
    const {formControl, locallyVisibleChanges$, viewSyncer} = setup()
    locallyVisibleChanges$.nextWithCache({general: 'A'})
    expect(formControl.value).toBe('<p></p>A')

    // A local edit just happened - arms the post-edit lockout (MIN_INTERVAL_MS).
    viewSyncer.lastLocalEditByUserMs = Date.now()

    // A genuinely newer value (e.g. edited on another browser) arrives while still locked out.
    locallyVisibleChanges$.nextWithCache({general: 'B - edited on another browser'})

    // Must not clobber the just-made local edit immediately...
    expect(formControl.value).toBe('<p></p>A')

    // ...but must not be lost either - once the lockout lifts, it applies automatically. Before
    // the fix, this update was simply forgotten forever once skipped here (GH #83 - "field text
    // value gets stuck on local version, even after page reload").
    vi.advanceTimersByTime(viewSyncer.MIN_INTERVAL_MS + 100)
    expect(formControl.value).toBe('<p></p>B - edited on another browser')
  })

  it('a further local edit while a retry is pending pushes the retry out, rather than applying stale data underneath it', () => {
    const {formControl, locallyVisibleChanges$, viewSyncer} = setup()
    locallyVisibleChanges$.nextWithCache({general: 'A'})
    viewSyncer.lastLocalEditByUserMs = Date.now()
    locallyVisibleChanges$.nextWithCache({general: 'B'})

    vi.advanceTimersByTime(5_000)
    // User keeps editing locally, resetting the lockout before the first retry would have fired.
    viewSyncer.lastLocalEditByUserMs = Date.now()

    vi.advanceTimersByTime(5_100) // enough time for the ORIGINAL retry, not the rescheduled one
    expect(formControl.value).toBe('<p></p>A')

    vi.advanceTimersByTime(5_000) // now past the rescheduled retry too
    expect(formControl.value).toBe('<p></p>B')
  })

  it('does not retry an update that never differed from what\'s already shown', () => {
    const {formControl, locallyVisibleChanges$, viewSyncer} = setup()
    locallyVisibleChanges$.nextWithCache({general: 'A'})
    viewSyncer.lastLocalEditByUserMs = Date.now()

    // Re-delivery of the exact already-applied (converted) value - not a new edit from anywhere.
    locallyVisibleChanges$.nextWithCache({general: '<p></p>A'})
    vi.advanceTimersByTime(20_000)

    expect(formControl.value).toBe('<p></p>A')
  })
})
