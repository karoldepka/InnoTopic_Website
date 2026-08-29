import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { QuizService } from './quiz.service'
import { QuizOptions } from './QuizOptions'
import { LearnItem } from '../../models/LearnItem'
import { LearnItem$ } from '../../models/LearnItem$'
import { CachedSubject } from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import { appGlobals } from '../../../../libs/AppFedShared/g'
import { FeaturesConfig } from '../../../../libs/AppFedShared/FeaturesConfig'
import { ExperimentalQuizScheduler } from './experimental-quiz-scheduler'

function makeFakeLearnDoService() {
  return {
    className: 'LearnItem',
    throttleSaveToDbMs: 3000,
    throttleIntervalMs: 500,
    treeRootItemId: 'ROOT',
    saveNowToDb: vi.fn(),
    emitLocalItems: vi.fn(),
    itemHistoryService: { onPatch: vi.fn() },
    syncStatusService: { handleSavingPromise: vi.fn() },
    authService: { authUser$: { lastVal: { uid: 'user-1' } } },
    localItems$: new CachedSubject<LearnItem$[]>([]),
    itemsLoaded: false,
  }
}

function makeFakeFeatureService(enabled = false) {
  const config = new FeaturesConfig(Object.assign({
    enableAll: false,
    beforeProductization: false,
  }, {experimentalQuizSchedulerEnabled: enabled}) as any)
  return {
    config$: new CachedSubject(config),
    experimentalQuizSchedulerEnabled: enabled,
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
    vi.useFakeTimers()
    // QuizOptions is persisted to localStorage (LocalOptionsPatchableObservable) - clear it so
    // a previous test/run can't leak its options into this one.
    localStorage.removeItem('QuizOptions')
    localStorage.removeItem('LifeSuite_experimentalQuizWorkingSet')
    // Normally set once by FeatureService's constructor during app bootstrap; quizStatus$ reads
    // it (via countBy2) so it must exist before anything subscribes.
    appGlobals.feat = new FeaturesConfig({enableAll: false, beforeProductization: false})
    fakeLearnDoService = makeFakeLearnDoService()
    quizService = new QuizService(
      fakeLearnDoService as any,
      {} as any,
      makeFakeFeatureService() as any,
      new ExperimentalQuizScheduler(),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Regression test for https://github.com/karoldepka/LifeSuite/issues/10
  // ("Quiz is stuck on 'Loading Quiz...'"). quizStatus$ combineLatest()s the item list together
  // with options and a request/timer pair; the item-list source used to be piped through
  // debounceTime(4000). debounceTime only ever emits once its source goes quiet - with the
  // collection backed by an always-on realtime subscription, continuous changes (another
  // device syncing, the initial two-phase local-cache-then-server load landing <4s apart, etc.)
  // could reset that timer indefinitely, so quizStatus$ - and the whole "Loading Quiz..." UI,
  // which is entirely gated on its first emission - could get stuck forever.
  it('keeps emitting quiz status even when the item list changes continuously, instead of getting stuck loading forever', async () => {
    quizService.setOptions(new QuizOptions(false, true))

    let emissionCount = 0
    const sub = quizService.quizStatus$.subscribe(() => emissionCount++)

    // Initial load already completed; this test is about the *ongoing* realtime churn.
    fakeLearnDoService.itemsLoaded = true

    // Simulate a live collection changing faster than the old 4s debounce window would ever
    // let settle: one new item list every second, for longer than that window.
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(1000)
      fakeLearnDoService.localItems$.next([makeItem$(fakeLearnDoService, { title: `item ${i}` })])
    }
    await vi.advanceTimersByTimeAsync(5000)

    expect(emissionCount).toBeGreaterThan(0)

    sub.unsubscribe()
  })

  // Regression test for https://github.com/karoldepka/LifeSuite/issues/23
  // ("Quiz is stuck at 'No quiz item'"). localItems$ starts out as a CachedSubject seeded with
  // `[]` synchronously at construction, before the initial load has actually run - so once the
  // #10 fix made quizStatus$ emit immediately, that pre-load `[]` was indistinguishable from a
  // genuinely empty collection and got reported as "0 items pending" right away. Assert
  // quizStatus$ stays silent (no status at all, i.e. the UI stays on "Loading Quiz...") until
  // itemsLoaded flips true, and then emits promptly once it does.
  it('does not emit any status until the item list has actually finished its initial load', async () => {
    quizService.setOptions(new QuizOptions(false, true))
    // itemsLoaded stays false; localItems$ still holds its constructor-default `[]`.

    let emissionCount = 0
    const sub = quizService.quizStatus$.subscribe(() => emissionCount++)
    await vi.advanceTimersByTimeAsync(10000)

    expect(emissionCount).toBe(0)

    fakeLearnDoService.itemsLoaded = true
    fakeLearnDoService.localItems$.next([])
    await vi.advanceTimersByTimeAsync(0)

    expect(emissionCount).toBe(1)

    sub.unsubscribe()
  })

  it('excludes category items from the pending count, even though they would otherwise be due', async () => {
    quizService.setOptions(new QuizOptions(false, false))
    fakeLearnDoService.itemsLoaded = true
    fakeLearnDoService.localItems$.next([
      makeItem$(fakeLearnDoService, { isCategory: true }, 'cat'),
    ])

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    await vi.advanceTimersByTimeAsync(1000)

    expect(lastStatus.itemsLeft).toBe(0)
    expect(lastStatus.nextItem$).toBeUndefined()

    sub.unsubscribe()
  })

  it('excludes AI-generated items when skipAiGenerated is enabled', async () => {
    quizService.setOptions(new QuizOptions(false, false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true))
    fakeLearnDoService.itemsLoaded = true
    fakeLearnDoService.localItems$.next([
      makeItem$(fakeLearnDoService, { whenGeneratedByAi: { seconds: 1, nanoseconds: 0 } as any }, 'ai-item'),
    ])

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    await vi.advanceTimersByTimeAsync(1000)

    expect(lastStatus.itemsLeft).toBe(0)
    expect(lastStatus.nextItem$).toBeUndefined()

    sub.unsubscribe()
  })

  it('restricts the quiz to only AI-generated items when onlyAiGenerated is enabled (GH #100)', async () => {
    quizService.setOptions(new QuizOptions(false, false, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, true))
    fakeLearnDoService.itemsLoaded = true
    fakeLearnDoService.localItems$.next([
      makeItem$(fakeLearnDoService, { whenGeneratedByAi: { seconds: 1, nanoseconds: 0 } as any }, 'ai-item'),
      makeItem$(fakeLearnDoService, {}, 'manual-item'),
    ])

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    await vi.advanceTimersByTimeAsync(1000)

    expect(lastStatus.itemsLeft).toBe(1)
    expect(lastStatus.nextItem$?.id).toBe('ai-item')

    sub.unsubscribe()
  })

  it('excludes task items when skipTasks is enabled (default), but includes them when disabled', async () => {
    quizService.setOptions(new QuizOptions(false, false, undefined, undefined, true))
    fakeLearnDoService.itemsLoaded = true
    fakeLearnDoService.localItems$.next([
      makeItem$(fakeLearnDoService, { isTask: true }, 'task-item'),
    ])

    let lastStatus: any
    let sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    await vi.advanceTimersByTimeAsync(1000)
    expect(lastStatus.itemsLeft).toBe(0)
    sub.unsubscribe()

    quizService.setOptions(new QuizOptions(false, false, undefined, undefined, false))
    sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    await vi.advanceTimersByTimeAsync(1000)
    expect(lastStatus.itemsLeft).toBe(1)
    expect(lastStatus.nextItem$?.id).toBe('task-item')

    sub.unsubscribe()
  })

  it('applies regex mode independently to categories and text', () => {
    const exactCategory = makeItem$(fakeLearnDoService, {categories: 'work', title: 'Beta topic'}, 'exact-category')
    const partialCategory = makeItem$(fakeLearnDoService, {categories: 'artwork', title: 'Beta topic'}, 'partial-category')
    const categoryRegexOptions = Object.assign(new QuizOptions(false, false), {
      categories: '(?:^|,\\s*)work(?:,|$)',
      textFilter: 'alpha,beta',
      useRegexCategories: true,
      useRegexTextFilter: false,
    })

    expect((quizService as any).filterByOptions(categoryRegexOptions, [exactCategory, partialCategory]))
      .toEqual([exactCategory])

    const textRegexMatch = makeItem$(fakeLearnDoService, {categories: 'study', title: 'Question 42'}, 'text-match')
    const textRegexMiss = makeItem$(fakeLearnDoService, {categories: 'study', title: 'Question number'}, 'text-miss')
    const textRegexOptions = Object.assign(new QuizOptions(false, false), {
      categories: 'work,study',
      textFilter: '^Question \\d+$',
      useRegexCategories: false,
      useRegexTextFilter: true,
    })

    expect((quizService as any).filterByOptions(textRegexOptions, [textRegexMatch, textRegexMiss]))
      .toEqual([textRegexMatch])
  })

  it('migrates the legacy combined regex preference to both per-field options', () => {
    localStorage.setItem('QuizOptions', JSON.stringify({
      dePrioritizeNewMaterial: false,
      onlyWithQA: true,
      useRegexFilters: true,
    }))

    const migratedService = new QuizService(
      makeFakeLearnDoService() as any,
      {} as any,
      makeFakeFeatureService() as any,
      new ExperimentalQuizScheduler(),
    )

    expect(migratedService.options2$.val.useRegexCategories).toBe(true)
    expect(migratedService.options2$.val.useRegexTextFilter).toBe(true)
  })

  it('does not throw and reports no next item when nothing is pending', async () => {
    quizService.setOptions(new QuizOptions(false, true))
    // localItems$ keeps its initial empty array (constructor default), but the load has
    // completed (genuinely empty collection, as opposed to issues#23's "not loaded yet").
    fakeLearnDoService.itemsLoaded = true

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    await vi.advanceTimersByTimeAsync(1000)

    expect(lastStatus).toBeDefined()
    expect(lastStatus.itemsLeft).toBe(0)
    expect(lastStatus.nextItem$).toBeUndefined()

    sub.unsubscribe()
  })

  it('uses only the experimental working set for selection while preserving the total remaining count', async () => {
    quizService = new QuizService(
      fakeLearnDoService as any,
      {} as any,
      makeFakeFeatureService(true) as any,
      new ExperimentalQuizScheduler(),
    )
    quizService.setOptions(Object.assign(new QuizOptions(false, false), {
      experimentalWorkingSetSize: 20,
    }))
    fakeLearnDoService.itemsLoaded = true
    const allItems = Array.from({length: 30}, (_, index) =>
      makeItem$(fakeLearnDoService, {}, `item-${index + 1}`))
    fakeLearnDoService.localItems$.next(allItems)

    let lastStatus: any
    const sub = quizService.quizStatus$.subscribe(status => lastStatus = status)
    await vi.advanceTimersByTimeAsync(1000)

    expect(lastStatus.itemsLeft).toBe(30)
    expect(lastStatus.experimentalScheduler).toMatchObject({
      mode: 'strict-batches',
      batchSize: 20,
      unmasteredCount: 20,
      backlogCount: 10,
      targetSize: 20,
    })
    expect(allItems.slice(0, 20)).toContain(lastStatus.nextItem$)

    sub.unsubscribe()
  })
})
