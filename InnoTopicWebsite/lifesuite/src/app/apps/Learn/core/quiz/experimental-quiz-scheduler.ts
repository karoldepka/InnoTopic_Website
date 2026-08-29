import {Injectable} from '@angular/core'
import type {LearnItem$} from '../../models/LearnItem$'

export const DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE = 20
export const MAX_EXPERIMENTAL_WORKING_SET_SIZE = 100
export const DEFAULT_EXPERIMENTAL_MASTERY_STARS = 2
export const MAX_EXPERIMENTAL_MASTERY_STARS = 5
/** Prevent an item from being selected again immediately after it was shown. */
export const DEFAULT_SAME_ITEM_MIN_DELAY_SECONDS = 60
export const EXPERIMENTAL_SCHEDULER_MODES = ['strict-batches', 'rolling'] as const
export type ExperimentalQuizSchedulerMode = typeof EXPERIMENTAL_SCHEDULER_MODES[number]
export const DEFAULT_EXPERIMENTAL_SCHEDULER_MODE: ExperimentalQuizSchedulerMode = 'strict-batches'
const INTERNAL_RATING_PER_STAR = 2.75 / 5

interface PersistedWorkingSet {
  schemaVersion: 3
  contextKey: string
  mode: ExperimentalQuizSchedulerMode
  batchTargetSize: number
  batchItemIds: string[]
  ratingsByItemId: Record<string, number>
  completedBatchItemIds: string[]
  lastPresentedAtByItemId: Record<string, number>
}

export interface ExperimentalQuizSchedulerStatus {
  mode: ExperimentalQuizSchedulerMode
  batchSize: number
  masteredCount: number
  unmasteredCount: number
  targetSize: number
  configuredSize: number
  backlogCount: number
  remainingCount: number
  masteryStars: number
  coolingDownCount: number
}

export interface ExperimentalQuizSchedulerSelection {
  /** All active, unmastered batch items, including any temporarily cooling down. */
  candidateItems: LearnItem$[]
  /** Active items that may be selected right now. */
  eligibleCandidateItems: LearnItem$[]
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

export function normalizeExperimentalMasteryStars(value: unknown): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_EXPERIMENTAL_MASTERY_STARS
  }
  const clamped = Math.min(MAX_EXPERIMENTAL_MASTERY_STARS, Math.max(0, numericValue))
  return Math.round(clamped * 2) / 2
}

export function normalizeSameItemMinDelaySeconds(value: unknown): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_SAME_ITEM_MIN_DELAY_SECONDS
  }
  return Math.max(0, Math.round(numericValue))
}

export function normalizeExperimentalSchedulerMode(value: unknown): ExperimentalQuizSchedulerMode {
  return EXPERIMENTAL_SCHEDULER_MODES.includes(value as ExperimentalQuizSchedulerMode)
    ? value as ExperimentalQuizSchedulerMode
    : DEFAULT_EXPERIMENTAL_SCHEDULER_MODE
}

/**
 * Experimental strict-batch layer for Quiz.
 *
 * It admits N currently-due items and never admits another item until every member of that
 * batch has received at least the configured star rating. Items below the threshold remain in
 * rotation; items at/above it stop appearing while the user finishes the rest of the batch.
 * The existing QuizItemChooser still decides which unmastered member appears next.
 */
@Injectable({providedIn: 'root'})
export class ExperimentalQuizScheduler {
  private static readonly storageKey = 'LifeSuite_experimentalQuizWorkingSet'

  private hydrated = false
  private contextKey = ''
  private mode: ExperimentalQuizSchedulerMode = DEFAULT_EXPERIMENTAL_SCHEDULER_MODE
  private batchTargetSize = DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE
  private batchItemIds: string[] = []
  private ratingsByItemId: Record<string, number> = {}
  /** Prevents a completed batch from being immediately re-admitted while rating patches settle. */
  private completedBatchItemIds: string[] = []
  private lastPresentedAtByItemId: Record<string, number> = {}

  selectWorkingSet(
    matchingItems: LearnItem$[],
    dueItems: LearnItem$[],
    requestedSize: unknown,
    requestedMasteryStars: unknown,
    requestedMode: unknown,
    contextKey: string,
    requestedSameItemMinDelaySeconds: unknown = DEFAULT_SAME_ITEM_MIN_DELAY_SECONDS,
    nowMs = Date.now(),
  ): ExperimentalQuizSchedulerSelection {
    this.hydrate()
    const configuredSize = normalizeExperimentalWorkingSetSize(requestedSize)
    const masteryStars = normalizeExperimentalMasteryStars(requestedMasteryStars)
    const mode = normalizeExperimentalSchedulerMode(requestedMode)
    const sameItemMinDelayMs = normalizeSameItemMinDelaySeconds(requestedSameItemMinDelaySeconds) * 1000
    const masteryRating = masteryStars * INTERNAL_RATING_PER_STAR
    if (this.contextKey !== contextKey || this.mode !== mode) {
      this.contextKey = contextKey
      this.mode = mode
      this.clearBatch()
      this.completedBatchItemIds = []
    }

    this.lastPresentedAtByItemId = Object.fromEntries(
      Object.entries(this.lastPresentedAtByItemId).filter(([id, presentedAt]) =>
        matchingItems.some(item => item.id === id) && nowMs - presentedAt < sameItemMinDelayMs),
    )

    const matchingById = new Map(
      matchingItems
        .filter(item => !!item.id)
        .map(item => [item.id as string, item] as const),
    )
    const dueIds = new Set(dueItems.map(item => item.id as string | undefined).filter((id): id is string => !!id))
    // A completion block only bridges the short interval before normal rating patches advance
    // due timestamps. Once an item is no longer due, regular spaced repetition owns it again.
    this.completedBatchItemIds = this.completedBatchItemIds
      .filter(id => matchingById.has(id) && dueIds.has(id))

    this.batchItemIds = this.batchItemIds.filter(id => matchingById.has(id))
    this.ratingsByItemId = Object.fromEntries(
      Object.entries(this.ratingsByItemId).filter(([id]) => this.batchItemIds.includes(id)),
    )

    if (mode === 'rolling') {
      return this.selectRollingWorkingSet(
        matchingById,
        dueItems,
        configuredSize,
        masteryStars,
        masteryRating,
        sameItemMinDelayMs,
        nowMs,
      )
    }

    let masteredIds = this.masteredIds(masteryRating)
    if (this.batchItemIds.length && masteredIds.size === this.batchItemIds.length) {
      this.completedBatchItemIds = Array.from(new Set([
        ...this.completedBatchItemIds,
        ...this.batchItemIds,
      ]))
      this.clearBatch()
      masteredIds = new Set()
    }

    if (!this.batchItemIds.length) {
      this.batchTargetSize = configuredSize
      const completedIds = new Set(this.completedBatchItemIds)
      this.batchItemIds = dueItems
        .map(item => item.id as string | undefined)
        .filter((id): id is string => !!id && !completedIds.has(id))
        .slice(0, this.batchTargetSize)
    }

    masteredIds = this.masteredIds(masteryRating)
    const batchIds = new Set(this.batchItemIds)
    const completedIds = new Set(this.completedBatchItemIds)
    const candidateItems = this.batchItemIds
      .filter(id => !masteredIds.has(id))
      .map(id => matchingById.get(id))
      .filter((item): item is LearnItem$ => !!item)
    const eligibleCandidateItems = this.eligibleItems(candidateItems, sameItemMinDelayMs, nowMs)
    const backlogItems = dueItems.filter(item =>
      !!item.id && !batchIds.has(item.id as string) && !completedIds.has(item.id as string))
    this.persist()

    return {
      candidateItems,
      eligibleCandidateItems,
      remainingItems: [...candidateItems, ...backlogItems],
      status: {
        mode,
        batchSize: this.batchItemIds.length,
        masteredCount: masteredIds.size,
        unmasteredCount: candidateItems.length,
        targetSize: this.batchTargetSize,
        configuredSize,
        backlogCount: backlogItems.length,
        remainingCount: candidateItems.length + backlogItems.length,
        masteryStars,
        coolingDownCount: candidateItems.length - eligibleCandidateItems.length,
      },
    }
  }

  private selectRollingWorkingSet(
    matchingById: Map<string, LearnItem$>,
    dueItems: LearnItem$[],
    configuredSize: number,
    masteryStars: number,
    masteryRating: number,
    sameItemMinDelayMs: number,
    nowMs: number,
  ): ExperimentalQuizSchedulerSelection {
    const masteredIds = this.masteredIds(masteryRating)
    if (masteredIds.size) {
      this.completedBatchItemIds = Array.from(new Set([
        ...this.completedBatchItemIds,
        ...masteredIds,
      ]))
      this.batchItemIds = this.batchItemIds.filter(id => !masteredIds.has(id))
      this.ratingsByItemId = Object.fromEntries(
        Object.entries(this.ratingsByItemId).filter(([id]) => this.batchItemIds.includes(id)),
      )
    }

    this.batchTargetSize = configuredSize
    this.batchItemIds = this.batchItemIds.slice(0, configuredSize)
    this.ratingsByItemId = Object.fromEntries(
      Object.entries(this.ratingsByItemId).filter(([id]) => this.batchItemIds.includes(id)),
    )
    const completedIds = new Set(this.completedBatchItemIds)
    const batchIds = new Set(this.batchItemIds)
    for (const item of dueItems) {
      if (this.batchItemIds.length >= configuredSize) {
        break
      }
      const itemId = item.id as string | undefined
      if (!itemId || batchIds.has(itemId) || completedIds.has(itemId)) {
        continue
      }
      this.batchItemIds.push(itemId)
      batchIds.add(itemId)
    }

    const candidateItems = this.batchItemIds
      .map(id => matchingById.get(id))
      .filter((item): item is LearnItem$ => !!item)
    const eligibleCandidateItems = this.eligibleItems(candidateItems, sameItemMinDelayMs, nowMs)
    const backlogItems = dueItems.filter(item =>
      !!item.id && !batchIds.has(item.id as string) && !completedIds.has(item.id as string))
    this.persist()

    return {
      candidateItems,
      eligibleCandidateItems,
      remainingItems: [...candidateItems, ...backlogItems],
      status: {
        mode: 'rolling',
        batchSize: candidateItems.length,
        masteredCount: 0,
        unmasteredCount: candidateItems.length,
        targetSize: configuredSize,
        configuredSize,
        backlogCount: backlogItems.length,
        remainingCount: candidateItems.length + backlogItems.length,
        masteryStars,
        coolingDownCount: candidateItems.length - eligibleCandidateItems.length,
      },
    }
  }

  recordRating(itemId: string | undefined, rating: number | undefined): void {
    if (!itemId || !this.batchItemIds.includes(itemId) || !Number.isFinite(rating)) {
      return
    }
    this.ratingsByItemId[itemId] = rating as number
    this.persist()
  }

  recordItemPresented(itemId: string | undefined, nowMs = Date.now()): void {
    if (!itemId || !Number.isFinite(nowMs)) {
      return
    }
    this.lastPresentedAtByItemId[itemId] = nowMs
    this.persist()
  }

  reset(): void {
    this.clearBatch()
    this.completedBatchItemIds = []
    this.lastPresentedAtByItemId = {}
    this.persist()
  }

  private masteredIds(masteryRating: number): Set<string> {
    return new Set(this.batchItemIds.filter(id =>
      Number.isFinite(this.ratingsByItemId[id]) && this.ratingsByItemId[id] >= masteryRating))
  }

  private clearBatch(): void {
    this.batchItemIds = []
    this.ratingsByItemId = {}
  }

  private eligibleItems(items: LearnItem$[], sameItemMinDelayMs: number, nowMs: number): LearnItem$[] {
    return items.filter(item => {
      const presentedAt = item.id ? this.lastPresentedAtByItemId[item.id] : undefined
      return !Number.isFinite(presentedAt) || nowMs - (presentedAt as number) >= sameItemMinDelayMs
    })
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
      const parsed = JSON.parse(stored) as Omit<Partial<PersistedWorkingSet>, 'schemaVersion'> & {
        schemaVersion?: number
      }
      // Version 1 used rolling replacement, so its state cannot represent a strict batch.
      if (parsed.schemaVersion !== 2 && parsed.schemaVersion !== 3) {
        return
      }
      this.contextKey = typeof parsed.contextKey === 'string' ? parsed.contextKey : ''
      this.mode = normalizeExperimentalSchedulerMode(parsed.mode)
      this.batchTargetSize = normalizeExperimentalWorkingSetSize(parsed.batchTargetSize)
      this.batchItemIds = Array.isArray(parsed.batchItemIds)
        ? parsed.batchItemIds.filter((id): id is string => typeof id === 'string')
        : []
      this.ratingsByItemId = parsed.ratingsByItemId && typeof parsed.ratingsByItemId === 'object'
        ? Object.fromEntries(Object.entries(parsed.ratingsByItemId)
          .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1])))
        : {}
      this.completedBatchItemIds = Array.isArray(parsed.completedBatchItemIds)
        ? parsed.completedBatchItemIds.filter((id): id is string => typeof id === 'string')
        : []
      this.lastPresentedAtByItemId = parsed.lastPresentedAtByItemId && typeof parsed.lastPresentedAtByItemId === 'object'
        ? Object.fromEntries(Object.entries(parsed.lastPresentedAtByItemId)
          .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1])))
        : {}
    } catch (error) {
      console.error('ExperimentalQuizScheduler: failed to load working set', error)
      this.contextKey = ''
      this.mode = DEFAULT_EXPERIMENTAL_SCHEDULER_MODE
      this.batchTargetSize = DEFAULT_EXPERIMENTAL_WORKING_SET_SIZE
      this.clearBatch()
      this.completedBatchItemIds = []
      this.lastPresentedAtByItemId = {}
    }
  }

  private persist(): void {
    try {
      globalThis.localStorage?.setItem(ExperimentalQuizScheduler.storageKey, JSON.stringify({
        schemaVersion: 3,
        contextKey: this.contextKey,
        mode: this.mode,
        batchTargetSize: this.batchTargetSize,
        batchItemIds: this.batchItemIds,
        ratingsByItemId: this.ratingsByItemId,
        completedBatchItemIds: this.completedBatchItemIds,
        lastPresentedAtByItemId: this.lastPresentedAtByItemId,
      } satisfies PersistedWorkingSet))
    } catch (error) {
      console.error('ExperimentalQuizScheduler: failed to persist working set', error)
    }
  }
}
