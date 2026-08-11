import {TimeMsDuration} from '../../../libs/AppFedShared/time/TimeMsDuration'

/** Persistent - "Raw" in new ODM parlance */
export class TimeTrackingPersistentData {
  whenFirstStarted: Date | null = null

  /** The app-relative URL (path + query + fragment, no origin - Angular Router's own `.url`)
   * tracking was started from, e.g. "/tree/item_abc" or "/journal/write/xyz" - captured once,
   * the first time this item starts tracking (see TimeTrackedEntry.startOrResumeTrackingIfNeeded()),
   * so the toolbar's own "jump to a tracked item" click can return to wherever it was actually
   * tracked from instead of a hardcoded per-collection guess (TimeTrackingToolbarComponent's old
   * COLLECTION_ROUTES, kept as a fallback for entries tracked before this field existed). */
  createdAtUrl: string | null = null

  // ==== tracking periods:
  previousTrackingsMs: TimeMsDuration | null = null

  nowTrackingSince: Date | null = null

  // ==== tracking pause periods:
  previousPausesMs: TimeMsDuration | null = null

  /* could rename to nowPausedSince for consistency and much shorter */
  whenCurrentPauseStarted: Date | null = null

  // /** this is for showing MRU item, even if done (could be crossed-out / grayed-out transparent) */
  // TODO whenLastTouched: Date | null = null
}
