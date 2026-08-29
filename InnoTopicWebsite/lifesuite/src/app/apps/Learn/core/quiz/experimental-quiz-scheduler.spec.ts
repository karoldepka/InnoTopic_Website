import {beforeEach, describe, expect, it} from 'vitest'
import {
  DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE,
  ExperimentalQuizScheduler,
  normalizeExperimentalWorkingSetSize,
} from './experimental-quiz-scheduler'
import type {LearnItem$} from '../../models/LearnItem$'

function items(count: number, offset = 0): LearnItem$[] {
  return Array.from({length: count}, (_, index) => ({id: `item-${index + offset + 1}`}) as LearnItem$)
}

describe('ExperimentalQuizScheduler', () => {
  beforeEach(() => localStorage.clear())

  it('limits a large due backlog to the configured working-set size', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(100)

    const selection = scheduler.selectWorkingSet(allItems, allItems, 20, 'filters-a')

    expect(selection.candidateItems).toHaveLength(20)
    expect(selection.remainingItems).toHaveLength(100)
    expect(selection.status).toMatchObject({activeCount: 20, backlogCount: 80, targetSize: 20})
  })

  it('retains a low-rated item but replaces a mastered item from the backlog', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(25)
    const first = scheduler.selectWorkingSet(allItems, allItems, 20, 'filters-a')
    const firstItemId = first.candidateItems[0].id as string

    scheduler.recordRating(firstItemId, 1.5)
    const afterLowRating = scheduler.selectWorkingSet(allItems, allItems.slice(1), 20, 'filters-a')
    expect(afterLowRating.candidateItems.map(item => item.id)).toContain(firstItemId)

    scheduler.recordRating(firstItemId, 2.2)
    // Keep the mastered item in dueItems to simulate the short interval before its normal
    // locally-visible rating patch advances the repetition timestamp.
    const afterMastery = scheduler.selectWorkingSet(allItems, allItems, 20, 'filters-a')
    expect(afterMastery.candidateItems.map(item => item.id)).not.toContain(firstItemId)
    expect(afterMastery.candidateItems.map(item => item.id)).toContain('item-21')
    expect(afterMastery.status).toMatchObject({activeCount: 20, backlogCount: 4})
  })

  it('resets the working set when filters change and normalizes invalid sizes', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const firstGroup = items(5)
    const secondGroup = items(5, 10)

    scheduler.selectWorkingSet(firstGroup, firstGroup, 3, 'filters-a')
    const changed = scheduler.selectWorkingSet(secondGroup, secondGroup, 2, 'filters-b')

    expect(changed.candidateItems.map(item => item.id)).toEqual(['item-11', 'item-12'])
    expect(normalizeExperimentalWorkingSetSize(undefined)).toBe(DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE)
    expect(normalizeExperimentalWorkingSetSize(0)).toBe(1)
    expect(normalizeExperimentalWorkingSetSize(999)).toBe(100)
  })
})
