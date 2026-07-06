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

describe('ListProcessing - funCravingPanic preset (GH issue #38)', () => {
  let listProcessing: ListProcessing

  beforeEach(() => {
    localStorage.removeItem('LifeSuite_options')
    listProcessing = new ListProcessing(makeFakeInjector() as any)
    listProcessing.listOptions$P.patchThrottled({preset: 'funCravingPanic'})
  })

  it('sorts by fun descending, then mental effort ascending, then most-recently-touched', () => {
    const items = [
      makeItem$({
        title: 'low fun, low effort, old',
        funEstimate: {numeric: 1} as any,
        mentalLevelEstimate: {numeric: 1} as any,
        whenLastModified: {toMillis: () => 1000} as any,
      }, 'a'),
      makeItem$({
        title: 'high fun, high effort',
        funEstimate: {numeric: 10} as any,
        mentalLevelEstimate: {numeric: 10} as any,
        whenLastModified: {toMillis: () => 2000} as any,
      }, 'b'),
      makeItem$({
        title: 'high fun, low effort, newer',
        funEstimate: {numeric: 10} as any,
        mentalLevelEstimate: {numeric: 1} as any,
        whenLastModified: {toMillis: () => 4000} as any,
      }, 'c'),
      makeItem$({
        title: 'high fun, low effort, older',
        funEstimate: {numeric: 10} as any,
        mentalLevelEstimate: {numeric: 1} as any,
        whenLastModified: {toMillis: () => 3000} as any,
      }, 'd'),
    ]

    listProcessing.setItemsAndSort(items)

    expect(listProcessing.item$s.map(item => item.id)).toEqual(['c', 'd', 'b', 'a'])
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
