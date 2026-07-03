import { fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing'
import { QuizService } from './quiz.service'
import { QuizOptions } from './QuizOptions'
import { LearnItem } from '../../models/LearnItem'
import { LearnItem$ } from '../../models/LearnItem$'
import { CachedSubject } from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import { appGlobals } from '../../../../libs/AppFedShared/g'
import { FeaturesConfig } from '../../../../libs/AppFedShared/FeaturesConfig'

function makeFakeLearnDoService() {
  return {
    className: 'LearnItem',
    throttleSaveToDbMs: 3000,
    throttleIntervalMs: 500,
    treeRootItemId: 'ROOT',
    saveNowToDb: jasmine.createSpy('saveNowToDb'),
    emitLocalItems: jasmine.createSpy('emitLocalItems'),
    itemHistoryService: { onPatch: jasmine.createSpy('onPatch') },
    syncStatusService: { handleSavingPromise: jasmine.createSpy('handleSavingPromise') },
    authService: { authUser$: { lastVal: { uid: 'user-1' } } },
    localItems$: new CachedSubject<LearnItem$[]>([]),
  }
}

/** Construct a LearnItem$ backed by a real LearnItem instance (no whenAdded/whenLastSelfRated
 * means Quiz.calculateWhenNextRepetitionMsEpoch() returns 0 - i.e. immediately due). */
function makeItem$(svc: any, data?: Partial<LearnItem>, id?: string): LearnItem$ {
  const learnItem = Object.assign(new LearnItem(), data ?? {})
  return new LearnItem$(svc, id as any, learnItem)
}

describe('QuizService — quizStatus$', () => {
  let fakeLearnDoService: ReturnType<typeof makeFakeLearnDoService>
  let quizService: QuizService

  beforeEach(() => {
    // QuizOptions is persisted to localStorage (LocalOptionsPatchableObservable) - clear it so
    // a previous test/run can't leak its options into this one.
    localStorage.removeItem('QuizOptions')
    // Normally set once by FeatureService's constructor during app bootstrap; quizStatus$ reads
    // it (via countBy2) so it must exist before anything subscribes.
    appGlobals.feat = new FeaturesConfig({enableAll: false})
    fakeLearnDoService = makeFakeLearnDoService()
    quizService = new QuizService(fakeLearnDoService as any, {} as any)
  })

  // Regression test for https://github.com/karoldepka/LifeSuite/issues/10
  // ("Quiz is stuck on 'Loading Quiz...'"). quizStatus$ combineLatest()s the item list together
  // with options and a request/timer pair; the item-list source used to be piped through
  // debounceTime(4000). debounceTime only ever emits once its source goes quiet - with the
  // collection backed by an always-on realtime subscription, continuous changes (another
  // device syncing, the initial two-phase local-cache-then-server load landing <4s apart, etc.)
  // could reset that timer indefinitely, so quizStatus$ - and the whole "Loading Quiz..." UI,
  // which is entirely gated on its first emission - could get stuck forever.
  it('keeps emitting quiz status even when the item list changes continuously, instead of getting stuck loading forever', fakeAsync(() => {
    quizService.setOptions(new QuizOptions(false, true))

    let emissionCount = 0
    const sub = quizService.quizStatus$.subscribe(() => emissionCount++)

    // Simulate a live collection changing faster than the old 4s debounce window would ever
    // let settle: one new item list every second, for longer than that window.
    for (let i = 0; i < 6; i++) {
      tick(1000)
      fakeLearnDoService.localItems$.next([makeItem$(fakeLearnDoService, { title: `item ${i}` })])
    }
    tick(5000)

    expect(emissionCount).toBeGreaterThan(0)

    sub.unsubscribe()
    discardPeriodicTasks()
  }))

  it('excludes category items from the pending count, even though they would otherwise be due', fakeAsync(() => {
    quizService.setOptions(new QuizOptions(false, false))
    fakeLearnDoService.localItems$.next([
      makeItem$(fakeLearnDoService, { isCategory: true }, 'cat'),
    ])

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    tick(1000)

    expect(lastStatus.itemsLeft).toBe(0)
    expect(lastStatus.nextItem$).toBeUndefined()

    sub.unsubscribe()
    discardPeriodicTasks()
  }))

  it('excludes AI-generated items when skipAiGenerated is enabled', fakeAsync(() => {
    quizService.setOptions(new QuizOptions(false, false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true))
    fakeLearnDoService.localItems$.next([
      makeItem$(fakeLearnDoService, { createdByAiAt: { seconds: 1, nanoseconds: 0 } as any }, 'ai-item'),
    ])

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    tick(1000)

    expect(lastStatus.itemsLeft).toBe(0)
    expect(lastStatus.nextItem$).toBeUndefined()

    sub.unsubscribe()
    discardPeriodicTasks()
  }))

  it('excludes task items when skipTasks is enabled (default), but includes them when disabled', fakeAsync(() => {
    quizService.setOptions(new QuizOptions(false, false, undefined, undefined, true))
    fakeLearnDoService.localItems$.next([
      makeItem$(fakeLearnDoService, { isTask: true }, 'task-item'),
    ])

    let lastStatus: any
    let sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    tick(1000)
    expect(lastStatus.itemsLeft).toBe(0)
    sub.unsubscribe()

    quizService.setOptions(new QuizOptions(false, false, undefined, undefined, false))
    sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    tick(1000)
    expect(lastStatus.itemsLeft).toBe(1)
    expect(lastStatus.nextItem$?.id).toBe('task-item')

    sub.unsubscribe()
    discardPeriodicTasks()
  }))

  it('does not throw and reports no next item when nothing is pending', fakeAsync(() => {
    quizService.setOptions(new QuizOptions(false, true))
    // localItems$ keeps its initial empty array (constructor default).

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    tick(1000)

    expect(lastStatus).toBeDefined()
    expect(lastStatus.itemsLeft).toBe(0)
    expect(lastStatus.nextItem$).toBeUndefined()

    sub.unsubscribe()
    discardPeriodicTasks()
  }))
})
