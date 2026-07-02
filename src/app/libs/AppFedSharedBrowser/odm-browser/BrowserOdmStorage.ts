import {Injectable} from '@angular/core'
import {PostgresOdmRow} from '../../AppFedSharedPostgres/odm-postgres/PostgresOdmRow'

/** Local-cache envelope around a `PostgresOdmRow` - same collection/id/owner/data/parent_ids/
 * ancestor_ids shape already used for Postgres, plus this device's own cache bookkeeping. */
export interface BrowserOdmRow<TRaw> extends PostgresOdmRow<TRaw> {
  key: string
  whenFirstStoredLocally: string
  whenLastStoredLocally: string
}

const DB_NAME = 'lifesuite-odm-cache'
const DB_VERSION = 1
const STORE = 'odm_items'
const COLLECTION_INDEX = 'by_collection'

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
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, {keyPath: 'key'})
      store.createIndex(COLLECTION_INDEX, 'collection')
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

  /** Upserts a row, preserving `whenFirstStoredLocally` from any existing row and always
   * bumping `whenLastStoredLocally`. Accepts either a fresh row or a previously-stored one
   * (e.g. spread with an override) - any local-cache fields on the input are ignored/recomputed.
   *
   * Multiple tabs share this same IndexedDB database. IndexedDB itself serializes
   * same-store transactions across tabs (no torn writes), but without this check a
   * late-arriving/stale write from one tab (e.g. a delayed realtime echo) could still land
   * *after* a newer write from another tab and silently regress the cached data - so a row
   * older than what's already cached is never allowed to overwrite it. */
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
}
