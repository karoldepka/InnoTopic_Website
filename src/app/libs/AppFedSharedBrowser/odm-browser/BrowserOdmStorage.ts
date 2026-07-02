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
}

const DB_NAME = 'lifesuite-odm-cache'
const DB_VERSION = 2
const STORE = 'odm_items'
const COLLECTION_INDEX = 'by_collection'
const SYNC_CURSORS_STORE = 'sync_cursors'
const PENDING_EDITS_STORE = 'pending_edits'

export interface OdmPendingEdit {
  key: string
  collection: string
  item_id: string
  /** Firestore dot-notation for nested fields (e.g. `"answer.text"`), matching Firestore's own
   * `.update()` convention - not forced through a flatten/diff step here, just typed to allow it. */
  patch: Record<string, any>
  whenLastModified: string
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

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
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
    }
    req.onsuccess = () => {
      const db = req.result
      // Another tab may need a future schema upgrade - don't hold this connection open and
      // block it forever.
      db.onversionchange = () => db.close()
      resolve(db)
    }
    req.onerror = () => reject(req.error)
  })
}

/** Full-fidelity local mirror of ODM rows, independent of whichever remote backend is active.
 * Kept complete enough (whole `data` payload, not a projection) to eventually serve as a
 * fallback read source if the server is unreachable - not wired up for that yet, just mirrored
 * into on every read/write today. */
@Injectable({providedIn: 'root'})
export class BrowserOdmStorage {
  private readonly dbp: Promise<IDBDatabase> = openDb()

  /** Emits whenever `put()` resolves a genuine conflict (see below) - subscribed to by
   * OdmConflictToastService to notify the user. */
  readonly conflictDetected$ = new Subject<OdmConflict>()

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
    const db = await this.dbp
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
  }

  async get<TRaw>(collection: string, itemId: string): Promise<BrowserOdmRow<TRaw> | undefined> {
    const db = await this.dbp
    const tx = db.transaction(STORE, 'readonly')
    return requestToPromise(tx.objectStore(STORE).get(rowKey(collection, itemId)))
  }

  async getAllForCollection<TRaw>(collection: string): Promise<BrowserOdmRow<TRaw>[]> {
    const db = await this.dbp
    const tx = db.transaction(STORE, 'readonly')
    const rows = await requestToPromise<BrowserOdmRow<TRaw>[]>(tx.objectStore(STORE).index(COLLECTION_INDEX).getAll(collection))
    return rows ?? []
  }

  async delete(collection: string, itemId: string): Promise<void> {
    const db = await this.dbp
    const tx = db.transaction(STORE, 'readwrite')
    await requestToPromise(tx.objectStore(STORE).delete(rowKey(collection, itemId)))
  }

  // ---- Sync cursor (per-collection watermark for incremental Supabase fetches) ----

  async getSyncCursor(collection: string): Promise<string | undefined> {
    const db = await this.dbp
    const tx = db.transaction(SYNC_CURSORS_STORE, 'readonly')
    const row = await requestToPromise<{collection: string, cursor: string} | undefined>(tx.objectStore(SYNC_CURSORS_STORE).get(collection))
    return row?.cursor
  }

  /** Max-merges against whatever's already stored - `observedServerModifiedAt` must only ever
   * be a value echoed back from Postgres's `server_modified_at` (never client-generated), so
   * this is immune to any client clock skew. Never regresses the cursor backward. */
  async updateSyncCursor(collection: string, observedServerModifiedAt: string): Promise<void> {
    const db = await this.dbp
    const tx = db.transaction(SYNC_CURSORS_STORE, 'readwrite')
    const store = tx.objectStore(SYNC_CURSORS_STORE)
    const existing = await requestToPromise<{collection: string, cursor: string} | undefined>(store.get(collection))
    if (existing && existing.cursor >= observedServerModifiedAt) {
      return
    }
    await requestToPromise(store.put({collection, cursor: observedServerModifiedAt}))
  }

  // ---- Durable pending-edit journal (survives reload/crash, not just this tab session) ----

  async savePendingEdit(collection: string, itemId: string, patch: Record<string, any>, whenLastModified: string): Promise<void> {
    const db = await this.dbp
    const tx = db.transaction(PENDING_EDITS_STORE, 'readwrite')
    const edit: OdmPendingEdit = {key: rowKey(collection, itemId), collection, item_id: itemId, patch, whenLastModified}
    await requestToPromise(tx.objectStore(PENDING_EDITS_STORE).put(edit))
  }

  async clearPendingEdit(collection: string, itemId: string): Promise<void> {
    const db = await this.dbp
    const tx = db.transaction(PENDING_EDITS_STORE, 'readwrite')
    await requestToPromise(tx.objectStore(PENDING_EDITS_STORE).delete(rowKey(collection, itemId)))
  }

  async getPendingEdit(collection: string, itemId: string): Promise<OdmPendingEdit | undefined> {
    const db = await this.dbp
    const tx = db.transaction(PENDING_EDITS_STORE, 'readonly')
    return requestToPromise(tx.objectStore(PENDING_EDITS_STORE).get(rowKey(collection, itemId)))
  }

  async getAllPendingEdits(collection: string): Promise<OdmPendingEdit[]> {
    const db = await this.dbp
    const tx = db.transaction(PENDING_EDITS_STORE, 'readonly')
    const all = await requestToPromise<OdmPendingEdit[]>(tx.objectStore(PENDING_EDITS_STORE).getAll())
    return (all ?? []).filter(edit => edit.collection === collection)
  }
}
