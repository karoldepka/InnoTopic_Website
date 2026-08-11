import {describe, it, expect, vi, beforeEach} from 'vitest'
import {ListProcessing} from './list-processing'
import {LearnItem} from '../models/LearnItem'
import {LearnItem$} from '../models/LearnItem$'
import {NavigationService} from '../../../shared/navigation.service'

/** Mirrors quiz.service.spec.ts's makeFakeLearnDoService/makeItem$ helpers - the minimal
 * OdmService2-shaped stub LearnItem$ needs to construct without a real backend. */
function makeFakeLearnDoService() {
  return {
    className: 'LearnItem',
    throttleSaveToDbMs: 3000,
    throttleIntervalMs: 500,
    treeRootItemId: 'ROOT',
    saveNowToDb: vi.fn(),
    emitLocalItems: vi.fn(),
    itemHistoryService: {onPatch: vi.fn()},
    syncStatusService: {handleSavingPromise: vi.fn()},
    authService: {authUser$: {lastVal: {uid: 'user-1'}}},
  }
}

function makeItem$(data: Partial<LearnItem>, id: string): LearnItem$ {
  const learnItem = Object.assign(new LearnItem(), data)
  return new LearnItem$(makeFakeLearnDoService() as any, id as any, learnItem)
}

/** Fake Injector - ListProcessing only ever calls injector.get(NavigationService), and
 * NavigationService.list is just a public field it writes the filtered results into. */
function makeFakeInjector() {
  const navigationService = new NavigationService()
  return {get: () => navigationService}
}

describe('ListProcessing - roiFunEasyImportance preset', () => {
  let listProcessing: ListProcessing

  beforeEach(() => {
    localStorage.removeItem('LifeSuite_options')
    listProcessing = new ListProcessing(makeFakeInjector() as any)
    listProcessing.listOptions$P.patchThrottled({preset: 'roiFunEasyImportance'})
  })

  it('sorts by ROI descending, then fun descending, then mental effort ("easy") ascending, then importance descending', () => {
    const items = [
      // Lowest ROI (importance 1 over 10 minutes) - should sort last regardless of its high fun.
      makeItem$({
        title: 'low roi, high fun',
        importance: {numeric: 1} as any,
        time_estimate: '10m',
        funEstimate: {numeric: 10} as any,
        mentalLevelEstimate: {numeric: 1} as any,
      }, 'low-roi'),
      // Highest ROI (importance 10 over 1 minute), but low fun and high mental effort - still
      // sorts first, since ROI outranks everything else.
      makeItem$({
        title: 'high roi, low fun, hard',
        importance: {numeric: 10} as any,
        time_estimate: '1m',
        funEstimate: {numeric: 1} as any,
        mentalLevelEstimate: {numeric: 10} as any,
      }, 'high-roi-low-fun'),
      // Same ROI as the pair below (importance 2 / 2 minutes) but higher fun - should come first
      // among the ROI-tied pair.
      makeItem$({
        title: 'roi tie, high fun, easy',
        importance: {numeric: 2} as any,
        time_estimate: '2m',
        funEstimate: {numeric: 10} as any,
        mentalLevelEstimate: {numeric: 1} as any,
      }, 'roi-tie-high-fun-easy'),
      // Same ROI and fun as the previous one, but harder (higher mental effort) - "easy" breaks
      // the tie, so this comes after it.
      makeItem$({
        title: 'roi tie, high fun, hard',
        importance: {numeric: 2} as any,
        time_estimate: '2m',
        funEstimate: {numeric: 10} as any,
        mentalLevelEstimate: {numeric: 9} as any,
      }, 'roi-tie-high-fun-hard'),
      // Same ROI/fun/mental as the pair above but lower importance - importance breaks the final
      // tie, so this comes last among the three ROI-tied items.
      makeItem$({
        title: 'roi tie, low fun',
        importance: {numeric: 2} as any,
        time_estimate: '2m',
        funEstimate: {numeric: 1} as any,
        mentalLevelEstimate: {numeric: 1} as any,
      }, 'roi-tie-low-fun'),
    ]

    listProcessing.setItemsAndSort(items)

    expect(listProcessing.item$s.map(item => item.id)).toEqual([
      'high-roi-low-fun',
      'roi-tie-high-fun-easy',
      'roi-tie-high-fun-hard',
      'roi-tie-low-fun',
      'low-roi',
    ])
  })
})

describe('ListProcessing - funCravingPanic preset (GH issue #38)', () => {
  let listProcessing: ListProcessing

  beforeEach(() => {
    localStorage.removeItem('LifeSuite_options')
    listProcessing = new ListProcessing(makeFakeInjector() as any)
    listProcessing.listOptions$P.patchThrottled({preset: 'funCravingPanic'})
  })

  it('sorts by fun descending, then ROI descending, then importance descending', () => {
    const items = [
      // Low fun - sorts last regardless of its high ROI/importance, since fun dominates.
      makeItem$({
        title: 'low fun, high roi, high importance',
        funEstimate: {numeric: 1} as any,
        importance: {numeric: 10} as any,
        time_estimate: '1m',
      }, 'low-fun'),
      // High fun, but the lowest ROI among the high-fun items - sorts last among them regardless
      // of importance.
      makeItem$({
        title: 'high fun, low roi',
        funEstimate: {numeric: 10} as any,
        importance: {numeric: 1} as any,
        time_estimate: '10m',
      }, 'high-fun-low-roi'),
      // High fun, ROI tied with the item below (same importance/time ratio) but lower importance
      // - importance breaks the tie, so this comes after it.
      makeItem$({
        title: 'high fun, roi tie, low importance',
        funEstimate: {numeric: 10} as any,
        importance: {numeric: 2} as any,
        time_estimate: '2m',
      }, 'high-fun-roi-tie-low-importance'),
      // High fun, same ROI ratio as above but higher importance - sorts first.
      makeItem$({
        title: 'high fun, roi tie, high importance',
        funEstimate: {numeric: 10} as any,
        importance: {numeric: 4} as any,
        time_estimate: '4m',
      }, 'high-fun-roi-tie-high-importance'),
    ]

    listProcessing.setItemsAndSort(items)

    expect(listProcessing.item$s.map(item => item.id)).toEqual([
      'high-fun-roi-tie-high-importance',
      'high-fun-roi-tie-low-importance',
      'high-fun-low-roi',
      'low-fun',
    ])
  })

  it('includes both tasks and non-task learn items, unlike the tasks-only default preset', () => {
    const items = [
      makeItem$({title: 'a task', isTask: true, funEstimate: {numeric: 5} as any}, 'task-1'),
      makeItem$({title: 'a learn item', isTask: false, funEstimate: {numeric: 5} as any}, 'learn-1'),
    ]

    listProcessing.setItemsAndSort(items)

    expect(listProcessing.filteredItem$s.map(item => item.id).sort()).toEqual(['learn-1', 'task-1'])
  })

  it('still excludes deleted and archived items', () => {
    const items = [
      makeItem$({title: 'normal', funEstimate: {numeric: 5} as any}, 'keep'),
      makeItem$({title: 'deleted', whenDeleted: {} as any, funEstimate: {numeric: 5} as any}, 'deleted'),
      makeItem$({title: 'archived', whenArchived: {} as any, funEstimate: {numeric: 5} as any}, 'archived'),
    ]

    listProcessing.setItemsAndSort(items)

    expect(listProcessing.filteredItem$s.map(item => item.id)).toEqual(['keep'])
  })
})
