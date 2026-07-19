import {Injectable} from '@angular/core'
import {Subject} from 'rxjs'
import {PostgresOdmRow} from '../../AppFedSharedPostgres/odm-postgres/PostgresOdmRow'

export interface OdmConflict {
  collection: string
  winnerId: string
  loserConflictId: string
  winnerWhenModified: string | null | undefined
  loserWhenModified: string | null | undefined
}

/** Local-cache envelope around a `PostgresOdmRow` - same collection/id/owner/data/parent_ids/
 * ancestor_ids shape already used for Postgres, plus this device's own cache bookkeeping. */
export interface BrowserOdmRow<TRaw> extends PostgresOdmRow<TRaw> {
  key: string
  whenFirstStoredLocally: string
  whenLastStoredLocally: string
  /** True only for a synthesized conflict-archival row (see `put()` below) - recovery-only
   * bookkeeping under its own synthetic id, never meant to be read back as a normal item. Readers
   * that surface rows as real app items (e.g. `BrowserOdmCollectionBackend.fetchRows`) must
   * exclude these, the same way they already exclude soft-deleted rows. */
  isConflictArchive?: boolean
}

const DB_NAME = 'lifesuite-odm-cache'
/** Exported (along with the store-name constants and `openDb` below) purely so tests can drive
 * schema-upgrade scenarios (a fresh DB, an upgrade from an older version, a version already
 * bumped by another tab) against the exact real migration logic, instead of a re-implemented
 * copy of it that could silently drift from what `connect()` actually runs in production. */
export const DB_VERSION = 4
export const STORE = 'odm_items'
export const COLLECTION_INDEX = 'by_collection'
export const SYNC_CURSORS_STORE = 'sync_cursors'
export const PENDING_EDITS_STORE = 'pending_edits'
export const PENDING_BLOB_UPLOADS_STORE = 'pending_blob_uploads'
export const BLOB_CACHE_STORE = 'blob_cache'

export interface OdmPendingEdit {
  key: string
  collection: string
  item_id: string
  /** Firestore dot-notation for nested fields (e.g. `"answer.text"`), matching Firestore's own
   * `.update()` convention - not forced through a flatten/diff step here, just typed to allow it. */
  patch: Record<string, any>
  whenLastModified: string
}

export type BlobKind = 'image-original' | 'image-thumbnail' | 'audio'

/** Durable "this blob still needs to reach Supabase Storage" journal entry - structurally
 * parallel to `OdmPendingEdit` above, and drained the same way (on `online` + app-ready). */
export interface PendingBlobUpload {
  key: string
  collection: string
  item_id: string
  blob_id: string
  blob: Blob
  content_type: string
  kind: BlobKind
  /** Links a thumbnail back to its full-size original's blob_id - must survive a reconnect retry
   * just like every other field here, or a retried upload would lose the relationship. */
  original_blob_id?: string
  /** Tags which field on the item this blob belongs to (e.g. a Journal text descriptor id, a
   * Learn side id, OrYoL's 'title') - only meaningful for voice memos, which (unlike pasted
   * images) aren't referenced inline from the field's own content, so this is the only way to
   * later list "every memo recorded against this particular field". */
  field_id?: string
  whenCreatedLocally: string
}

/** Local cache of blob bytes, keyed by `blob_id` - separate from `pending_blob_uploads` since a
 * blob can also arrive via download (resolving a reference on read), not just a pending upload. */
export interface CachedBlob {
  blob_id: string
  blob: Blob
  whenLastStoredLocally: string
}

function rowKey(collection: string, itemId: string): string {
  return `${collection}::${itemId}`
}

/** True only when both timestamps are present and `a` is unambiguously before `b`. */
function isStrictlyOlder(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) {
    return false
  }
  return new Date(a).getTime() < new Date(b).getTime()
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** `version` has no default - callers must pass `undefined` explicitly to mean "connect at
 * whatever version is already there, no upgrade" (used to recover from a VersionError below).
 * A default parameter can't express that: JS substitutes a parameter's default whenever the
 * caller passes `undefined`, explicitly or not, so `openDb(undefined)` would silently become
 * `openDb(DB_VERSION)` again - re-requesting the exact stale version that just failed - if
 * `version` had `= DB_VERSION` here instead of every caller passing it explicitly.
 *
 * `dbName` defaults to the real production database and only ever needs overriding from tests,
 * so schema-upgrade scenarios can be driven against an isolated, disposable database instead of
 * the one every other test in this file shares. */
export function openDb(version: number | undefined, dbName: string = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = version === undefined ? indexedDB.open(dbName) : indexedDB.open(dbName, version)
    req.onupgradeneeded = (event) => {
      const db = req.result
      if (event.oldVersion < 1) {
        const store = db.createObjectStore(STORE, {keyPath: 'key'})
        store.createIndex(COLLECTION_INDEX, 'collection')
      }
      if (event.oldVersion < 2) {
        db.createObjectStore(SYNC_CURSORS_STORE, {keyPath: 'collection'})
        db.createObjectStore(PENDING_EDITS_STORE, {keyPath: 'key'})
      }
      if (event.oldVersion < 3) {
        // A prior bug let a *limited* preview fetch (opts1: top-270-most-recently-modified)
        // also advance the sync cursor from its own max server_modified_at, even though it
        // never saw most of the collection - not a real "everything up to here is synced"
        // watermark. That silently cursor-skipped the rest of the collection on every
        // following incremental fetch (see SupabaseOdmCollectionBackend.fetchRows). Wipe any
        // cursor written under the old, buggy logic so every device does one full resync and
        // self-heals, rather than requiring a manual storage clear.
        req.transaction!.objectStore(SYNC_CURSORS_STORE).clear()
      }
      if (event.oldVersion < 4) {
        db.createObjectStore(PENDING_BLOB_UPLOADS_STORE, {keyPath: 'key'})
        db.createObjectStore(BLOB_CACHE_STORE, {keyPath: 'blob_id'})
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Full-fidelity local mirror of ODM rows, independent of whichever remote backend is active.
 * Kept complete enough (whole `data` payload, not a projection) to eventually serve as a
 * fallback read source if the server is unreachable - not wired up for that yet, just mirrored
 * into on every read/write today. */
@Injectable({providedIn: 'root'})
export class BrowserOdmStorage {
  /** Must be declared before `dbPromise` below - field initializers run in declaration order, and
   * `connect()` (called synchronously by `dbPromise`'s initializer) sets this to `true` as its
   * first step. If this field came after `dbPromise`, its own `= false` initializer would run
   * right after and silently stomp that back to `false`, making the very first reconnect
   * misreported as the initial connection and skipping the `connectionRecovered$` notification
   * below. */
  private hasConnectedBefore = false

  /** Must also be declared before `dbPromise` below, for the same field-initializer-order reason
   * as `hasConnectedBefore` above - `connect()` reads it synchronously. Never overridden outside
   * `forTesting()` below - stays a plain field (not a constructor parameter) specifically so this
   * class keeps a normal zero-arg constructor Angular's DI can resolve for its real
   * `@Injectable(providedIn: 'root')` singleton; a constructor parameter with no injection token
   * (a bare `string`) fails AOT compilation ("NG2003: No suitable injection token"). */
  private dbName = DB_NAME

  private dbPromise: Promise<IDBDatabase> = this.connect()

  /** Test-only: builds an instance pointed at a disposable database instead of the real shared
   * one, so tests can exercise reconnect/version-upgrade/multi-connection behavior in isolation.
   * The plain `new BrowserOdmStorage()` call below briefly connects to the real shared database
   * name first (same as every other instance in the app or other tests) before this redirects it
   * - harmless, since this file's existing tests already coexist with many simultaneous
   * connections to that same shared name. */
  static forTesting(dbName: string): BrowserOdmStorage {
    const instance = new BrowserOdmStorage()
    instance.dbName = dbName
    instance.dbPromise = instance.connect()
    return instance
  }

  /** Shared between `connect()`'s own onversionchange/onclose handlers and `withDb()`'s retry
   * path below, so only one reconnect ever gets scheduled per failure no matter which of the two
   * notices first - `close()` firing the actual `onclose` event can lag a tick or two behind the
   * call that triggered it, so a `withDb()` operation racing right after a close is often the
   * *first* to notice the connection is dead, before the event handler below has run at all. */
  private reconnectScheduled = false

  /** Opens the database and arranges to transparently reconnect if the connection ever dies -
   * either because another tab (e.g. one left open across a deploy that bumped DB_VERSION)
   * triggers a schema upgrade, or the browser reclaims an idle connection. Without this, every
   * put()/get() after either event throws "the database connection is closing" forever, until
   * the page is fully reloaded. */
  private connect(): Promise<IDBDatabase> {
    const isReconnect = this.hasConnectedBefore
    this.hasConnectedBefore = true
    return openDb(DB_VERSION, this.dbName)
      .catch(error => {
        if (error instanceof DOMException && error.name === 'VersionError') {
          // Another, newer connection (e.g. a tab that reloaded after a later deploy) already
          // upgraded the schema past what this loaded bundle's DB_VERSION constant knows about -
          // connect at whatever version is already there instead of looping on the same error.
          return openDb(undefined, this.dbName)
        }
        throw error
      })
      .then(db => {
        // This connection is live - the *next* close, whenever it happens, needs a fresh
        // reconnect scheduled again.
        this.reconnectScheduled = false
        if (isReconnect) {
          // Only fires for a *re*connect, never the initial connect at construction time - a
          // fresh page load reconnecting for the first time isn't news to the user.
          this.connectionRecovered$.next()
        }
        const reconnect = () => {
          if (this.reconnectScheduled) {
            return
          }
          this.reconnectScheduled = true
          this.dbPromise = this.connect()
        }
        db.onversionchange = () => {
          db.close()
          reconnect()
        }
        db.onclose = reconnect
        return db
      })
  }

  /** Runs `op` against the current connection, retrying it once against a freshly-reconnected
   * one if `op` lost a race against the connection closing (it was handed a `db` that died
   * between being resolved and `op` actually calling `db.transaction(...)` on it). Shares
   * `reconnectScheduled` with `connect()`'s own onversionchange/onclose handlers rather than just
   * blindly re-awaiting `dbPromise`, since the close event that will eventually reassign
   * `dbPromise` can fire *after* this catch block runs - without that shared gate, the retry
   * would just hit the exact same dead connection again. Every method below is read-then-write
   * against fresh state fetched inside `op`, so re-running the whole thing from scratch is always
   * safe - nothing here partially applies on the first attempt before this can trigger. */
  private async withDb<T>(op: (db: IDBDatabase) => Promise<T>): Promise<T> {
    const db = await this.dbPromise
    try {
      return await op(db)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        if (!this.reconnectScheduled) {
          this.reconnectScheduled = true
          this.dbPromise = this.connect()
        }
        const freshDb = await this.dbPromise
        return op(freshDb)
      }
      throw error
    }
  }

  /** Test-only: closes the current connection so the next call has to reconnect first, and so
   * tests can release their own connection instead of leaking it for the rest of the run
   * (IndexedDB connections are otherwise never closed automatically). */
  async closeConnectionForTesting(): Promise<void> {
    const db = await this.dbPromise
    db.close()
  }

  /** Wipes every local collection's cache, pending-edit journal, and blob cache - used on logout
   * so a different user signing in on the same shared device never sees a previous user's cached
   * rows (rows are keyed by collection+item_id only, not by owner, so nothing else here would
   * segregate them). Deliberately does NOT try to surgically reconnect afterward and race the
   * automatic onclose-triggered reconnect this close() below schedules - the caller is expected
   * to reload the page right after this resolves, which sidesteps that entirely by starting a
   * fresh JS context (and fresh, empty database) from scratch. */
  async clearAllLocalData(): Promise<void> {
    const db = await this.dbPromise
    db.close()
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(this.dbName)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => resolve() // best-effort; caller reloads the page regardless
    })
  }

  /** Emits whenever the connection had to be silently reconnected (see `connect()`) - subscribed
   * to by IndexedDbHealthToastService so a user whose local cache had a hiccup isn't left
   * wondering why things briefly felt off, even though nothing was actually lost. */
  readonly connectionRecovered$ = new Subject<void>()

  /** Emits whenever `put()` resolves a genuine conflict (see below) - subscribed to by
   * OdmConflictToastService to notify the user. */
  readonly conflictDetected$ = new Subject<OdmConflict>()

  /** Emits whenever the pending-edits journal changes (savePendingEdit/clearPendingEdit) -
   * subscribed to by SyncStatusService to keep a reload-surviving "still needs to sync" count/
   * list, distinct from (and a superset of) the in-memory-only "actively saving right now"
   * promise tracking it already had. */
  readonly pendingEditsChanged$ = new Subject<void>()

  /** Emits whenever the pending-blob-uploads journal changes - same purpose as
   * `pendingEditsChanged$` above, but for blob uploads (BlobSyncService), subscribed to by
   * SyncStatusService's own `durablePendingBlobUploads$`. */
  readonly pendingBlobUploadsChanged$ = new Subject<void>()

  /** Upserts a row, preserving `whenFirstStoredLocally` from any existing row and always
   * bumping `whenLastStoredLocally`. Accepts either a fresh row or a previously-stored one
   * (e.g. spread with an override) - any local-cache fields on the input are ignored/recomputed.
   *
   * Multiple tabs share this same IndexedDB database. IndexedDB itself serializes
   * same-store transactions across tabs (no torn writes), but without this check a
   * late-arriving/stale write from one tab (e.g. a delayed realtime echo) could still land
   * *after* a newer write from another tab and silently regress the cached data - so a row
   * older than what's already cached is never allowed to overwrite it.
   *
   * If the older, losing row's `data` actually *differs* from what's cached (a genuine
   * conflicting edit, not just a benign duplicate/replay of data we already have), it isn't
   * silently discarded - it's archived as its own row (id suffixed `_conflict_<timestamp>`)
   * and `conflictDetected$` fires, so resolution is best-effort but never lossy. */
  async put<TRaw>(row: PostgresOdmRow<TRaw> & Partial<Pick<BrowserOdmRow<TRaw>, 'key' | 'whenFirstStoredLocally' | 'whenLastStoredLocally'>>): Promise<BrowserOdmRow<TRaw>> {
    return this.withDb(async db => {
      const key = rowKey(row.collection, row.item_id)
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      const existing = await requestToPromise<BrowserOdmRow<TRaw> | undefined>(store.get(key))
      const now = new Date().toISOString()

      if (existing && isStrictlyOlder(row.when_last_modified, existing.when_last_modified)) {
        // Stale write lost the race - keep the newer cached row, just note this tab saw it.
        const refreshed: BrowserOdmRow<TRaw> = {...existing, whenLastStoredLocally: now}
        await requestToPromise(store.put(refreshed))

        if (JSON.stringify(row.data) !== JSON.stringify(existing.data)) {
          const loserId = `${row.item_id}_conflict_${(row.when_last_modified ?? now).replace(/[:.]/g, '-')}`
          const loserRow: BrowserOdmRow<TRaw> = {
            ...row,
            item_id: loserId,
            key: rowKey(row.collection, loserId),
            whenFirstStoredLocally: now,
            whenLastStoredLocally: now,
            isConflictArchive: true,
          }
          await requestToPromise(store.put(loserRow))
          this.conflictDetected$.next({
            collection: row.collection,
            winnerId: row.item_id,
            loserConflictId: loserId,
            winnerWhenModified: existing.when_last_modified,
            loserWhenModified: row.when_last_modified,
          })
        }

        return refreshed
      }

      const merged: BrowserOdmRow<TRaw> = {
        ...row,
        key,
        whenFirstStoredLocally: existing?.whenFirstStoredLocally ?? now,
        whenLastStoredLocally: now,
      }
      await requestToPromise(store.put(merged))
      return merged
    })
  }

  async get<TRaw>(collection: string, itemId: string): Promise<BrowserOdmRow<TRaw> | undefined> {
    return this.withDb(db => {
      const tx = db.transaction(STORE, 'readonly')
      return requestToPromise(tx.objectStore(STORE).get(rowKey(collection, itemId)))
    })
  }

  async getAllForCollection<TRaw>(collection: string): Promise<BrowserOdmRow<TRaw>[]> {
    return this.withDb(async db => {
      const tx = db.transaction(STORE, 'readonly')
      const rows = await requestToPromise<BrowserOdmRow<TRaw>[]>(tx.objectStore(STORE).index(COLLECTION_INDEX).getAll(collection))
      return rows ?? []
    })
  }

  async delete(collection: string, itemId: string): Promise<void> {
    return this.withDb(async db => {
      const tx = db.transaction(STORE, 'readwrite')
      await requestToPromise(tx.objectStore(STORE).delete(rowKey(collection, itemId)))
    })
  }

  // ---- Sync cursor (per-collection watermark for incremental Supabase fetches) ----

  async getSyncCursor(collection: string): Promise<string | undefined> {
    return this.withDb(async db => {
      const tx = db.transaction(SYNC_CURSORS_STORE, 'readonly')
      const row = await requestToPromise<{collection: string, cursor: string} | undefined>(tx.objectStore(SYNC_CURSORS_STORE).get(collection))
      return row?.cursor
    })
  }

  /** Max-merges against whatever's already stored - `observedServerModifiedAt` must only ever
   * be a value echoed back from Postgres's `server_modified_at` (never client-generated), so
   * this is immune to any client clock skew. Never regresses the cursor backward. */
  async updateSyncCursor(collection: string, observedServerModifiedAt: string): Promise<void> {
    return this.withDb(async db => {
      const tx = db.transaction(SYNC_CURSORS_STORE, 'readwrite')
      const store = tx.objectStore(SYNC_CURSORS_STORE)
      const existing = await requestToPromise<{collection: string, cursor: string} | undefined>(store.get(collection))
      if (existing && existing.cursor >= observedServerModifiedAt) {
        return
      }
      await requestToPromise(store.put({collection, cursor: observedServerModifiedAt}))
    })
  }

  // ---- Durable pending-edit journal (survives reload/crash, not just this tab session) ----

  /** Merges onto whatever's already journaled rather than overwriting it outright. Each tab
   * keeps its own in-memory `pendingDbPatch` (only the fields *that tab* has changed since its
   * own last confirmed write), so two tabs with the same item open concurrently each call this
   * independently - a blind `put()` here would let whichever tab saves last silently erase the
   * other tab's still-unsynced fields from the durable journal, with no way to recover them once
   * that other tab closes. Merging (and keeping the later `whenLastModified`) means a genuine
   * same-field conflict still resolves last-write-wins (unavoidable), but the much more common
   * case - two tabs editing *different* fields on the same entry - keeps both. */
  async savePendingEdit(collection: string, itemId: string, patch: Record<string, any>, whenLastModified: string): Promise<void> {
    await this.withDb(async db => {
      const tx = db.transaction(PENDING_EDITS_STORE, 'readwrite')
      const store = tx.objectStore(PENDING_EDITS_STORE)
      const key = rowKey(collection, itemId)
      const existing = await requestToPromise<OdmPendingEdit | undefined>(store.get(key))
      const edit: OdmPendingEdit = {
        key,
        collection,
        item_id: itemId,
        patch: {...existing?.patch, ...patch},
        whenLastModified: (existing && existing.whenLastModified > whenLastModified) ? existing.whenLastModified : whenLastModified,
      }
      await requestToPromise(store.put(edit))
    })
    this.pendingEditsChanged$.next()
  }

  async clearPendingEdit(collection: string, itemId: string): Promise<void> {
    await this.withDb(async db => {
      const tx = db.transaction(PENDING_EDITS_STORE, 'readwrite')
      await requestToPromise(tx.objectStore(PENDING_EDITS_STORE).delete(rowKey(collection, itemId)))
    })
    this.pendingEditsChanged$.next()
  }

  async getPendingEdit(collection: string, itemId: string): Promise<OdmPendingEdit | undefined> {
    return this.withDb(db => {
      const tx = db.transaction(PENDING_EDITS_STORE, 'readonly')
      return requestToPromise(tx.objectStore(PENDING_EDITS_STORE).get(rowKey(collection, itemId)))
    })
  }

  /** Every still-unsynced edit across all collections - the reload-surviving source of truth for
   * "what still needs to reach the server" (the in-memory promise tracking in SyncStatusService
   * alone doesn't survive a reload, and previously cleared its count on a failed save even though
   * the edit was still durably queued for retry). */
  async getAllPendingEditsEverywhere(): Promise<OdmPendingEdit[]> {
    return this.withDb(async db => {
      const tx = db.transaction(PENDING_EDITS_STORE, 'readonly')
      const all = await requestToPromise<OdmPendingEdit[]>(tx.objectStore(PENDING_EDITS_STORE).getAll())
      return all ?? []
    })
  }

  async getAllPendingEdits(collection: string): Promise<OdmPendingEdit[]> {
    const all = await this.getAllPendingEditsEverywhere()
    return all.filter(edit => edit.collection === collection)
  }

  // ---- Durable pending-blob-upload journal (mirrors the pending-edit journal above, for
  // BlobSyncService's upload of images/audio to Supabase Storage instead of row patches) ----

  async savePendingBlobUpload(upload: Omit<PendingBlobUpload, 'key'>): Promise<void> {
    await this.withDb(async db => {
      const tx = db.transaction(PENDING_BLOB_UPLOADS_STORE, 'readwrite')
      const key = `${upload.collection}::${upload.item_id}::${upload.blob_id}`
      await requestToPromise(tx.objectStore(PENDING_BLOB_UPLOADS_STORE).put({...upload, key}))
    })
    this.pendingBlobUploadsChanged$.next()
  }

  async clearPendingBlobUpload(collection: string, itemId: string, blobId: string): Promise<void> {
    await this.withDb(async db => {
      const tx = db.transaction(PENDING_BLOB_UPLOADS_STORE, 'readwrite')
      await requestToPromise(tx.objectStore(PENDING_BLOB_UPLOADS_STORE).delete(`${collection}::${itemId}::${blobId}`))
    })
    this.pendingBlobUploadsChanged$.next()
  }

  /** Every still-unsynced blob upload across all collections - the reload-surviving source of
   * truth for "what still needs to reach Storage", same role `getAllPendingEditsEverywhere`
   * plays for row patches. */
  async getAllPendingBlobUploadsEverywhere(): Promise<PendingBlobUpload[]> {
    return this.withDb(async db => {
      const tx = db.transaction(PENDING_BLOB_UPLOADS_STORE, 'readonly')
      const all = await requestToPromise<PendingBlobUpload[]>(tx.objectStore(PENDING_BLOB_UPLOADS_STORE).getAll())
      return all ?? []
    })
  }

  // ---- Local blob cache (populated on upload for instant local render, or on download to avoid
  // re-fetching the same blob from Storage repeatedly) ----

  async cacheBlob(blobId: string, blob: Blob): Promise<void> {
    return this.withDb(async db => {
      const tx = db.transaction(BLOB_CACHE_STORE, 'readwrite')
      const cached: CachedBlob = {blob_id: blobId, blob, whenLastStoredLocally: new Date().toISOString()}
      await requestToPromise(tx.objectStore(BLOB_CACHE_STORE).put(cached))
    })
  }

  async getCachedBlob(blobId: string): Promise<Blob | undefined> {
    return this.withDb(async db => {
      const tx = db.transaction(BLOB_CACHE_STORE, 'readonly')
      const cached = await requestToPromise<CachedBlob | undefined>(tx.objectStore(BLOB_CACHE_STORE).get(blobId))
      return cached?.blob
    })
  }
}
