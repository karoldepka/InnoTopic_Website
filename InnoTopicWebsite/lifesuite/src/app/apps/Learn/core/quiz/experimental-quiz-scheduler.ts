import {Injectable} from '@angular/core'
import type {LearnItem$} from '../../models/LearnItem$'

export const DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE = 20
export const MAX_EXPERIMENTAL_WORKING_SET_SIZE = 100
/** Four visible stars map to 2.2 on the internally persisted 0–2.75 rating scale. */
export const EXPERIMENTAL_MASTERY_RATING = 2.2

interface PersistedWorkingSet {
  contextKey: string
  activeItemIds: string[]
  masteredItemIds: string[]
}

export interface ExperimentalQuizSchedulerStatus {
  activeCount: number
  targetSize: number
  backlogCount: number
  remainingCount: number
  masteryStars: number
}

export interface ExperimentalQuizSchedulerSelection {
  candidateItems: LearnItem$[]
  remainingItems: LearnItem$[]
  status: ExperimentalQuizSchedulerStatus
}

export function normalizeExperimentalWorkingSetSize(value: unknown): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE
  }
  return Math.min(MAX_EXPERIMENTAL_WORKING_SET_SIZE, Math.max(1, Math.round(numericValue)))
}

/**
 * Experimental bounded working-set layer for Quiz.
 *
 * It admits only N currently-due items, then retains those items even after their normal
 * repetition timestamp moves into the future. A rating of at least four stars removes an item
 * from the set; lower ratings leave it available for another pass. The existing QuizItemChooser
 * still decides which member of the set appears next.
 */
@Injectable({providedIn: 'root'})
export class ExperimentalQuizScheduler {
  private static readonly storageKey = 'LifeSuite_experimentalQuizWorkingSet'

  private hydrated = false
  private contextKey = ''
  private activeItemIds: string[] = []
  private masteredItemIds: string[] = []

  selectWorkingSet(
    matchingItems: LearnItem$[],
    dueItems: LearnItem$[],
    requestedSize: unknown,
    contextKey: string,
  ): ExperimentalQuizSchedulerSelection {
    this.hydrate()
    const targetSize = normalizeExperimentalWorkingSetSize(requestedSize)
    if (this.contextKey !== contextKey) {
      this.contextKey = contextKey
      this.activeItemIds = []
      this.masteredItemIds = []
    }

    const matchingById = new Map(
      matchingItems
        .filter(item => !!item.id)
        .map(item => [item.id as string, item] as const),
    )
    const dueIds = new Set(dueItems.map(item => item.id as string | undefined).filter((id): id is string => !!id))
    // A mastery block only bridges the short interval before the item's normal rating patch
    // advances its due timestamp. Once it is no longer due, the regular scheduler owns it again.
    this.masteredItemIds = this.masteredItemIds.filter(id => matchingById.has(id) && dueIds.has(id))
    const masteredIds = new Set(this.masteredItemIds)
    this.activeItemIds = this.activeItemIds
      .filter(id => matchingById.has(id) && !masteredIds.has(id))
      .slice(0, targetSize)

    const activeIds = new Set(this.activeItemIds)
    for (const item of dueItems) {
      if (this.activeItemIds.length >= targetSize) {
        break
      }
      const itemId = item.id as string | undefined
      if (!itemId || activeIds.has(itemId) || masteredIds.has(itemId)) {
        continue
      }
      this.activeItemIds.push(itemId)
      activeIds.add(itemId)
    }

    const candidateItems = this.activeItemIds
      .map(id => matchingById.get(id))
      .filter((item): item is LearnItem$ => !!item)
    const backlogItems = dueItems.filter(item =>
      !!item.id && !activeIds.has(item.id as string) && !masteredIds.has(item.id as string))
    this.persist()

    return {
      candidateItems,
      remainingItems: [...candidateItems, ...backlogItems],
      status: {
        activeCount: candidateItems.length,
        targetSize,
        backlogCount: backlogItems.length,
        remainingCount: candidateItems.length + backlogItems.length,
        masteryStars: 4,
      },
    }
  }

  recordRating(itemId: string | undefined, rating: number | undefined): void {
    if (!itemId || !Number.isFinite(rating) || (rating as number) < EXPERIMENTAL_MASTERY_RATING) {
      return
    }
    const nextIds = this.activeItemIds.filter(id => id !== itemId)
    if (nextIds.length !== this.activeItemIds.length) {
      this.activeItemIds = nextIds
      if (!this.masteredItemIds.includes(itemId)) {
        this.masteredItemIds.push(itemId)
      }
      this.persist()
    }
  }

  reset(): void {
    this.activeItemIds = []
    this.masteredItemIds = []
    this.persist()
  }

  private hydrate(): void {
    if (this.hydrated) {
      return
    }
    this.hydrated = true
    try {
      const stored = globalThis.localStorage?.getItem(ExperimentalQuizScheduler.storageKey)
      if (!stored) {
        return
      }
      const parsed = JSON.parse(stored) as Partial<PersistedWorkingSet>
      this.contextKey = typeof parsed.contextKey === 'string' ? parsed.contextKey : ''
      this.activeItemIds = Array.isArray(parsed.activeItemIds)
        ? parsed.activeItemIds.filter((id): id is string => typeof id === 'string')
        : []
      this.masteredItemIds = Array.isArray(parsed.masteredItemIds)
        ? parsed.masteredItemIds.filter((id): id is string => typeof id === 'string')
        : []
    } catch (error) {
      console.error('ExperimentalQuizScheduler: failed to load working set', error)
      this.contextKey = ''
      this.activeItemIds = []
      this.masteredItemIds = []
    }
  }

  private persist(): void {
    try {
      globalThis.localStorage?.setItem(ExperimentalQuizScheduler.storageKey, JSON.stringify({
        contextKey: this.contextKey,
        activeItemIds: this.activeItemIds,
        masteredItemIds: this.masteredItemIds,
      } satisfies PersistedWorkingSet))
    } catch (error) {
      console.error('ExperimentalQuizScheduler: failed to persist working set', error)
    }
  }
}
