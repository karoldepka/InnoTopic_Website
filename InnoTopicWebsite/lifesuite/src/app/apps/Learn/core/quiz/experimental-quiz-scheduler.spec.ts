import {beforeEach, describe, expect, it} from 'vitest'
import {
  DEFAULT_EXPERIMENTAL_MASTERY_STARS,
  DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE,
  ExperimentalQuizScheduler,
  DEFAULT_SAME_ITEM_MIN_DELAY_SECONDS,
  normalizeExperimentalMasteryStars,
  normalizeExperimentalSchedulerMode,
  normalizeExperimentalWorkingSetSize,
  normalizeSameItemMinDelaySeconds,
} from './experimental-quiz-scheduler'
import type {LearnItem$} from '../../models/LearnItem$'

function items(count: number, offset = 0): LearnItem$[] {
  return Array.from({length: count}, (_, index) => ({id: `item-${index + offset + 1}`}) as LearnItem$)
}

function internalRating(stars: number): number {
  return stars * (2.75 / 5)
}

describe('ExperimentalQuizScheduler', () => {
  beforeEach(() => localStorage.clear())

  it('limits a large due backlog to the configured strict batch', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(100)

    const selection = scheduler.selectWorkingSet(allItems, allItems, 20, 2, 'strict-batches', 'filters-a')

    expect(selection.candidateItems).toHaveLength(20)
    expect(selection.remainingItems).toHaveLength(100)
    expect(selection.status).toMatchObject({
      batchSize: 20,
      masteredCount: 0,
      unmasteredCount: 20,
      backlogCount: 80,
      targetSize: 20,
      masteryStars: 2,
    })
  })

  it('admits no backlog items until every item in the current batch reaches X', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(8)
    const firstBatch = scheduler.selectWorkingSet(allItems, allItems, 3, 2, 'strict-batches', 'filters-a')
    expect(firstBatch.candidateItems.map(item => item.id)).toEqual(['item-1', 'item-2', 'item-3'])

    scheduler.recordRating('item-1', internalRating(2))
    let selection = scheduler.selectWorkingSet(allItems, allItems, 3, 2, 'strict-batches', 'filters-a')
    expect(selection.candidateItems.map(item => item.id)).toEqual(['item-2', 'item-3'])
    expect(selection.candidateItems.map(item => item.id)).not.toContain('item-4')
    expect(selection.status).toMatchObject({batchSize: 3, masteredCount: 1, backlogCount: 5})

    scheduler.recordRating('item-2', internalRating(4))
    scheduler.recordRating('item-3', internalRating(1.5))
    selection = scheduler.selectWorkingSet(allItems, allItems, 3, 2, 'strict-batches', 'filters-a')
    expect(selection.candidateItems.map(item => item.id)).toEqual(['item-3'])
    expect(selection.candidateItems.map(item => item.id)).not.toContain('item-4')

    scheduler.recordRating('item-3', internalRating(2))
    // Keep the completed batch in dueItems to simulate rating patches that have not propagated.
    selection = scheduler.selectWorkingSet(allItems, allItems, 3, 2, 'strict-batches', 'filters-a')
    expect(selection.candidateItems.map(item => item.id)).toEqual(['item-4', 'item-5', 'item-6'])
    expect(selection.status).toMatchObject({batchSize: 3, masteredCount: 0, backlogCount: 2})
  })

  it('replaces each mastered item immediately in rolling mode', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(8)
    scheduler.selectWorkingSet(allItems, allItems, 3, 2, 'rolling', 'filters-a')

    scheduler.recordRating('item-1', internalRating(2))
    const selection = scheduler.selectWorkingSet(allItems, allItems, 3, 2, 'rolling', 'filters-a')

    expect(selection.candidateItems.map(item => item.id)).toEqual(['item-2', 'item-3', 'item-4'])
    expect(selection.status).toMatchObject({mode: 'rolling', batchSize: 3, backlogCount: 4})
  })

  it('does not make a recently shown item eligible for its own immediate repeat', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(2)
    const nowMs = 1_000_000
    scheduler.selectWorkingSet(allItems, allItems, 2, 2, 'strict-batches', 'filters-a', 60, nowMs)
    scheduler.recordItemPresented('item-1', nowMs)

    const duringCooldown = scheduler.selectWorkingSet(allItems, allItems, 2, 2, 'strict-batches', 'filters-a', 60, nowMs + 59_999)
    expect(duringCooldown.candidateItems.map(item => item.id)).toEqual(['item-1', 'item-2'])
    expect(duringCooldown.eligibleCandidateItems.map(item => item.id)).toEqual(['item-2'])
    expect(duringCooldown.status.coolingDownCount).toBe(1)

    const afterCooldown = scheduler.selectWorkingSet(allItems, allItems, 2, 2, 'strict-batches', 'filters-a', 60, nowMs + 60_000)
    expect(afterCooldown.eligibleCandidateItems.map(item => item.id)).toEqual(['item-1', 'item-2'])
  })

  it('starts a fresh set when the scheduler mode changes', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(8)
    scheduler.selectWorkingSet(allItems, allItems, 3, 2, 'strict-batches', 'filters-a')

    const changed = scheduler.selectWorkingSet(allItems, allItems.slice(3), 3, 2, 'rolling', 'filters-a')

    expect(changed.candidateItems.map(item => item.id)).toEqual(['item-4', 'item-5', 'item-6'])
  })

  it('re-evaluates recorded ratings when X changes and applies N changes to the next batch', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const allItems = items(5)
    scheduler.selectWorkingSet(allItems, allItems, 2, 3, 'strict-batches', 'filters-a')
    scheduler.recordRating('item-1', internalRating(2))
    scheduler.recordRating('item-2', internalRating(2))

    const stillCurrentBatch = scheduler.selectWorkingSet(allItems, allItems, 1, 3, 'strict-batches', 'filters-a')
    expect(stillCurrentBatch.status).toMatchObject({batchSize: 2, configuredSize: 1, masteredCount: 0})

    const nextBatch = scheduler.selectWorkingSet(allItems, allItems, 1, 2, 'strict-batches', 'filters-a')
    expect(nextBatch.candidateItems.map(item => item.id)).toEqual(['item-3'])
    expect(nextBatch.status).toMatchObject({batchSize: 1, targetSize: 1, masteryStars: 2})
  })

  it('resets the batch when filters change and normalizes invalid settings', () => {
    const scheduler = new ExperimentalQuizScheduler()
    const firstGroup = items(5)
    const secondGroup = items(5, 10)

    scheduler.selectWorkingSet(firstGroup, firstGroup, 3, 2, 'strict-batches', 'filters-a')
    const changed = scheduler.selectWorkingSet(secondGroup, secondGroup, 2, 2, 'strict-batches', 'filters-b')

    expect(changed.candidateItems.map(item => item.id)).toEqual(['item-11', 'item-12'])
    expect(normalizeExperimentalWorkingSetSize(undefined)).toBe(DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE)
    expect(normalizeExperimentalWorkingSetSize(0)).toBe(1)
    expect(normalizeExperimentalWorkingSetSize(999)).toBe(100)
    expect(normalizeExperimentalMasteryStars(undefined)).toBe(DEFAULT_EXPERIMENTAL_MASTERY_STARS)
    expect(normalizeExperimentalMasteryStars(1.24)).toBe(1)
    expect(normalizeExperimentalMasteryStars(99)).toBe(5)
    expect(normalizeExperimentalSchedulerMode('rolling')).toBe('rolling')
    expect(normalizeExperimentalSchedulerMode('invalid')).toBe('strict-batches')
    expect(normalizeSameItemMinDelaySeconds(undefined)).toBe(DEFAULT_SAME_ITEM_MIN_DELAY_SECONDS)
    expect(normalizeSameItemMinDelaySeconds(-1)).toBe(0)
  })
})
