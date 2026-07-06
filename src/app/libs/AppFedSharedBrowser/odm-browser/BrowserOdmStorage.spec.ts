import {describe, it, expect, beforeEach, afterEach} from 'vitest'
import {
  BrowserOdmStorage,
  openDb,
  DB_VERSION,
  STORE,
  COLLECTION_INDEX,
  SYNC_CURSORS_STORE,
  PENDING_EDITS_STORE,
  PENDING_BLOB_UPLOADS_STORE,
  BLOB_CACHE_STORE,
} from './BrowserOdmStorage'
import {createPostgresOdmRow} from '../../AppFedSharedPostgres/odm-postgres/PostgresOdmRow'

interface SutItem {
  title: string
}

// Every test uses its own random collection name so runs never see each other's rows,
// even though they all share the same physical IndexedDB database.
function uniqueCollection(): string {
  return `SutCollection_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

describe('BrowserOdmStorage', () => {
  let storage: BrowserOdmStorage

  beforeEach(() => {
    storage = new BrowserOdmStorage()
  })

  it('put() then get() round-trips the row', async () => {
    const collection = uniqueCollection()
    const row = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'hello'})

    await storage.put(row)
    const found = await storage.get<SutItem>(collection, 'item1')

    expect(found?.data.title).toBe('hello')
    expect(found?.owner).toBe('owner1')
  })

  it('get() returns undefined for a row that was never stored', async () => {
    const found = await storage.get(uniqueCollection(), 'missing')
    expect(found).toBeUndefined()
  })

  it('preserves whenFirstStoredLocally and bumps whenLastStoredLocally across repeated puts', async () => {
    const collection = uniqueCollection()
    const row1 = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'v1'})
    const first = await storage.put(row1)

    await new Promise(resolve => setTimeout(resolve, 5))

    const row2 = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'v2'})
    const second = await storage.put(row2)

    expect(second.whenFirstStoredLocally).toBe(first.whenFirstStoredLocally)
    expect(new Date(second.whenLastStoredLocally).getTime())
      .toBeGreaterThan(new Date(first.whenLastStoredLocally).getTime())
    expect(second.data.title).toBe('v2')
  })

  it('a strictly older write (by when_last_modified) does not clobber a newer cached row', async () => {
    const collection = uniqueCollection()
    const newer = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'newer'})
    newer.when_last_modified = new Date('2024-01-02T00:00:00.000Z').toISOString()
    await storage.put(newer)

    const stale = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'stale'})
    stale.when_last_modified = new Date('2024-01-01T00:00:00.000Z').toISOString()
    const result = await storage.put(stale)

    expect(result.data.title).toBe('newer')
    const stored = await storage.get<SutItem>(collection, 'item1')
    expect(stored?.data.title).toBe('newer')
  })

  it('a newer write does overwrite older cached data', async () => {
    const collection = uniqueCollection()
    const older = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'older'})
    older.when_last_modified = new Date('2024-01-01T00:00:00.000Z').toISOString()
    await storage.put(older)

    const newer = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'newer'})
    newer.when_last_modified = new Date('2024-01-02T00:00:00.000Z').toISOString()
    const result = await storage.put(newer)

    expect(result.data.title).toBe('newer')
  })

  it('newer data arriving from a server fetch overwrites what was already cached', async () => {
    // Mirrors what SupabaseOdmCollectionBackend.fetchRows -> put() does on an incremental sync:
    // the row already exists locally (from a prior sync/mirror), then a fresher server row
    // for the same id arrives and must replace it.
    const collection = uniqueCollection()
    const fromFirstSync = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'as of first sync'})
    fromFirstSync.when_last_modified = new Date('2024-01-01T00:00:00.000Z').toISOString()
    await storage.put(fromFirstSync)

    const fromIncrementalSync = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'edited server-side since'})
    fromIncrementalSync.when_last_modified = new Date('2024-02-01T00:00:00.000Z').toISOString()
    const result = await storage.put(fromIncrementalSync)

    expect(result.data.title).toBe('edited server-side since')
    const stored = await storage.get<SutItem>(collection, 'item1')
    expect(stored?.data.title).toBe('edited server-side since')
  })

  it('newer data arriving from a server fetch for a brand new id is simply added', async () => {
    const collection = uniqueCollection()
    const fromServer = createPostgresOdmRow<SutItem>(collection, 'newItem', 'owner1', {title: 'never seen before'})

    const result = await storage.put(fromServer)

    expect(result.data.title).toBe('never seen before')
    expect(result.whenFirstStoredLocally).toBe(result.whenLastStoredLocally)
  })

  describe('conflict resolution', () => {
    it('a strictly-older write with DIFFERENT data archives the loser and emits conflictDetected$', async () => {
      const collection = uniqueCollection()
      const conflicts: any[] = []
      storage.conflictDetected$.subscribe(c => conflicts.push(c))

      const winner = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'winner (newer)'})
      winner.when_last_modified = new Date('2024-01-02T00:00:00.000Z').toISOString()
      await storage.put(winner)

      const loser = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'loser (older, different)'})
      loser.when_last_modified = new Date('2024-01-01T00:00:00.000Z').toISOString()
      const result = await storage.put(loser)

      // Winner is unchanged at the original key.
      expect(result.data.title).toBe('winner (newer)')
      const stored = await storage.get<SutItem>(collection, 'item1')
      expect(stored?.data.title).toBe('winner (newer)')

      // Loser was archived, not dropped.
      const expectedLoserId = `item1_conflict_${loser.when_last_modified!.replace(/[:.]/g, '-')}`
      const archived = await storage.get<SutItem>(collection, expectedLoserId)
      expect(archived?.data.title).toBe('loser (older, different)')

      // Notified exactly once.
      expect(conflicts.length).toBe(1)
      expect(conflicts[0]).toMatchObject({
        collection,
        winnerId: 'item1',
        loserConflictId: expectedLoserId,
      })
    })

    it('a strictly-older write with IDENTICAL data is treated as a benign duplicate, not a conflict', async () => {
      const collection = uniqueCollection()
      const conflicts: any[] = []
      storage.conflictDetected$.subscribe(c => conflicts.push(c))

      const winner = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'same content'})
      winner.when_last_modified = new Date('2024-01-02T00:00:00.000Z').toISOString()
      await storage.put(winner)

      const duplicate = createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'same content'})
      duplicate.when_last_modified = new Date('2024-01-01T00:00:00.000Z').toISOString()
      await storage.put(duplicate)

      expect(conflicts.length).toBe(0)
      const allRows = await storage.getAllForCollection<SutItem>(collection)
      expect(allRows.length).toBe(1)
    })
  })

  describe('sync cursor', () => {
    it('getSyncCursor returns undefined when nothing has been recorded yet', async () => {
      expect(await storage.getSyncCursor(uniqueCollection())).toBeUndefined()
    })

    it('updateSyncCursor then getSyncCursor round-trips', async () => {
      const collection = uniqueCollection()
      await storage.updateSyncCursor(collection, '2024-01-01T00:00:00.000Z')
      expect(await storage.getSyncCursor(collection)).toBe('2024-01-01T00:00:00.000Z')
    })

    it('a lower observed value never moves the cursor backward', async () => {
      const collection = uniqueCollection()
      await storage.updateSyncCursor(collection, '2024-06-01T00:00:00.000Z')
      await storage.updateSyncCursor(collection, '2024-01-01T00:00:00.000Z')
      expect(await storage.getSyncCursor(collection)).toBe('2024-06-01T00:00:00.000Z')
    })

    it('a higher observed value advances the cursor', async () => {
      const collection = uniqueCollection()
      await storage.updateSyncCursor(collection, '2024-01-01T00:00:00.000Z')
      await storage.updateSyncCursor(collection, '2024-06-01T00:00:00.000Z')
      expect(await storage.getSyncCursor(collection)).toBe('2024-06-01T00:00:00.000Z')
    })
  })

  describe('pending-edit journal', () => {
    it('savePendingEdit then getPendingEdit round-trips', async () => {
      const collection = uniqueCollection()
      await storage.savePendingEdit(collection, 'item1', {title: 'unsynced edit'}, '2024-01-01T00:00:00.000Z')

      const edit = await storage.getPendingEdit(collection, 'item1')

      expect(edit?.patch).toEqual({title: 'unsynced edit'})
      expect(edit?.whenLastModified).toBe('2024-01-01T00:00:00.000Z')
    })

    it('clearPendingEdit removes it', async () => {
      const collection = uniqueCollection()
      await storage.savePendingEdit(collection, 'item1', {title: 'x'}, '2024-01-01T00:00:00.000Z')

      await storage.clearPendingEdit(collection, 'item1')

      expect(await storage.getPendingEdit(collection, 'item1')).toBeUndefined()
    })

    it('getAllPendingEdits only returns edits for that collection', async () => {
      const collectionA = uniqueCollection()
      const collectionB = uniqueCollection()
      await storage.savePendingEdit(collectionA, 'a1', {title: 'a1'}, '2024-01-01T00:00:00.000Z')
      await storage.savePendingEdit(collectionB, 'b1', {title: 'b1'}, '2024-01-01T00:00:00.000Z')

      const editsA = await storage.getAllPendingEdits(collectionA)

      expect(editsA.length).toBe(1)
      expect(editsA[0].item_id).toBe('a1')
    })
  })

  describe('pending-blob-upload journal and blob cache', () => {
    it('savePendingBlobUpload then getAllPendingBlobUploadsEverywhere round-trips', async () => {
      const collection = uniqueCollection()
      const blob = new Blob(['fake-image-bytes'], {type: 'image/webp'})
      await storage.savePendingBlobUpload({
        collection, item_id: 'item1', blob_id: 'blob1', blob,
        content_type: 'image/webp', kind: 'image-thumbnail',
        whenCreatedLocally: '2024-01-01T00:00:00.000Z',
      })

      const all = await storage.getAllPendingBlobUploadsEverywhere()
      const found = all.find(u => u.collection === collection)

      expect(found?.blob_id).toBe('blob1')
      expect(found?.kind).toBe('image-thumbnail')
      expect(found?.blob.size).toBe(blob.size)
    })

    it('clearPendingBlobUpload removes it', async () => {
      const collection = uniqueCollection()
      const blob = new Blob(['x'], {type: 'image/webp'})
      await storage.savePendingBlobUpload({
        collection, item_id: 'item1', blob_id: 'blob1', blob,
        content_type: 'image/webp', kind: 'image-thumbnail',
        whenCreatedLocally: '2024-01-01T00:00:00.000Z',
      })

      await storage.clearPendingBlobUpload(collection, 'item1', 'blob1')

      const all = await storage.getAllPendingBlobUploadsEverywhere()
      expect(all.find(u => u.collection === collection)).toBeUndefined()
    })

    it('cacheBlob then getCachedBlob round-trips', async () => {
      const blob = new Blob(['cached-bytes'], {type: 'image/webp'})

      await storage.cacheBlob('blob-abc', blob)
      const cached = await storage.getCachedBlob('blob-abc')

      expect(cached?.size).toBe(blob.size)
    })

    it('getCachedBlob returns undefined for a blob that was never cached', async () => {
      expect(await storage.getCachedBlob('never-cached')).toBeUndefined()
    })
  })

  it('getAllForCollection only returns rows for that collection', async () => {
    const collectionA = uniqueCollection()
    const collectionB = uniqueCollection()
    await storage.put(createPostgresOdmRow<SutItem>(collectionA, 'a1', 'owner1', {title: 'a1'}))
    await storage.put(createPostgresOdmRow<SutItem>(collectionA, 'a2', 'owner1', {title: 'a2'}))
    await storage.put(createPostgresOdmRow<SutItem>(collectionB, 'b1', 'owner1', {title: 'b1'}))

    const rowsA = await storage.getAllForCollection<SutItem>(collectionA)

    expect(rowsA.length).toBe(2)
    expect(rowsA.map(row => row.item_id).sort()).toEqual(['a1', 'a2'])
  })

  it('delete() removes the row', async () => {
    const collection = uniqueCollection()
    await storage.put(createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'v1'}))

    await storage.delete(collection, 'item1')

    expect(await storage.get(collection, 'item1')).toBeUndefined()
  })

  describe('recovery from a dead connection', () => {
    // Uses closeConnectionForTesting() (a direct .close() on the current connection) rather than
    // opening a second connection at a higher version: a version bump fires `versionchange` on
    // every other open connection sharing this physical database - including every earlier
    // test's never-closed `storage` instance in this same run - which cascades into a storm of
    // background reconnects unrelated to what's under test here. A plain close() only affects
    // this test's own connection.

    it('put()/get() still succeed after the connection closes, instead of failing forever', async () => {
      const collection = uniqueCollection()
      await storage.put(createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'before'}))

      await storage.closeConnectionForTesting()

      const result = await storage.put(createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'after'}))
      expect(result.data.title).toBe('after')
      expect((await storage.get<SutItem>(collection, 'item1'))?.data.title).toBe('after')
    })

    it('every kind of operation recovers, not just put()/get()', async () => {
      const collection = uniqueCollection()

      await storage.closeConnectionForTesting()
      await storage.updateSyncCursor(collection, '2024-01-01T00:00:00.000Z')
      expect(await storage.getSyncCursor(collection)).toBe('2024-01-01T00:00:00.000Z')

      await storage.closeConnectionForTesting()
      await storage.savePendingEdit(collection, 'item1', {title: 'unsynced'}, '2024-01-01T00:00:00.000Z')
      expect((await storage.getPendingEdit(collection, 'item1'))?.patch).toEqual({title: 'unsynced'})

      await storage.closeConnectionForTesting()
      await storage.clearPendingEdit(collection, 'item1')
      expect(await storage.getPendingEdit(collection, 'item1')).toBeUndefined()

      await storage.closeConnectionForTesting()
      await storage.put(createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'v1'}))
      await storage.closeConnectionForTesting()
      await storage.delete(collection, 'item1')
      expect(await storage.get(collection, 'item1')).toBeUndefined()
    })

    it('emits connectionRecovered$ once reconnected, but not on the initial connection', async () => {
      const recoveries: void[] = []
      storage.connectionRecovered$.subscribe(() => recoveries.push(undefined))

      expect(recoveries.length).toBe(0)

      await storage.closeConnectionForTesting()
      await storage.get(uniqueCollection(), 'missing') // awaits `dbPromise`, forcing the reconnect to finish

      expect(recoveries.length).toBe(1)
    })

    it('a save racing the connection closing still succeeds instead of surfacing the race', async () => {
      // Fires put() without first awaiting the close, unlike the tests above - this gives the
      // narrow window where put() already grabbed the dying connection before reconnect()
      // replaced it a real chance to happen, exercising withDb()'s own retry rather than only
      // the connect()-level reconnect that a strictly-sequential close-then-put would rely on.
      const collection = uniqueCollection()
      await storage.put(createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'before'}))

      const closePromise = storage.closeConnectionForTesting()
      const putPromise = storage.put(createPostgresOdmRow<SutItem>(collection, 'item1', 'owner1', {title: 'after'}))

      await closePromise
      const result = await putPromise

      expect(result.data.title).toBe('after')
      expect((await storage.get<SutItem>(collection, 'item1'))?.data.title).toBe('after')
    })
  })
})

// Simulates the real multi-context scenarios Journal entries actually live through: a second
// browser tab open on the same entry, and a tab left open across a deploy that bumps DB_VERSION.
// Each BrowserOdmStorage here is pointed at its own disposable, uniquely-named database (via the
// constructor's dbName override, test-only) rather than the shared production one those tests
// above use - a version bump against the shared name would fire `versionchange` on every other
// open connection in the same test run, including every earlier test's never-closed instance.
describe('BrowserOdmStorage multi-tab and schema-update scenarios', () => {
  let dbName: string
  let storagesToClose: BrowserOdmStorage[]

  function uniqueDbName(): string {
    return `BrowserOdmStorage_multitab_test_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }

  beforeEach(() => {
    dbName = uniqueDbName()
    storagesToClose = []
  })

  afterEach(async () => {
    for (const s of storagesToClose) {
      await s.closeConnectionForTesting().catch(() => {})
    }
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(dbName)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => resolve()
    })
  })

  it('a write from "tab A" is immediately visible to "tab B" - two independent connections to the same database', async () => {
    const tabA = BrowserOdmStorage.forTesting(dbName)
    const tabB = BrowserOdmStorage.forTesting(dbName)
    storagesToClose.push(tabA, tabB)
    const collection = 'JournalEntry'

    await tabA.put(createPostgresOdmRow<SutItem>(collection, 'entry1', 'owner1', {title: 'written in tab A'}))

    const seenFromTabB = await tabB.get<SutItem>(collection, 'entry1')
    expect(seenFromTabB?.data.title).toBe('written in tab A')
  })

  it('two tabs editing the same entry with different timestamps resolve exactly like a single-connection conflict would', async () => {
    // Same conflict-resolution assertions as the single-storage test above, but the two writes
    // now come from genuinely separate BrowserOdmStorage instances - each tab has its own JS
    // state/instance in real usage, not just two sequential calls on one object.
    const tabA = BrowserOdmStorage.forTesting(dbName)
    const tabB = BrowserOdmStorage.forTesting(dbName)
    storagesToClose.push(tabA, tabB)
    const collection = 'JournalEntry'
    // conflictDetected$ is per-instance, not a cross-tab broadcast - only whichever connection's
    // own put() actually performs the losing write ever sees it (correct: that's the tab whose
    // user needs to know their edit got archived, not the other tab that happened to win).
    const conflictsSeenByTabA: any[] = []
    tabA.conflictDetected$.subscribe(c => conflictsSeenByTabA.push(c))

    const fromTabA = createPostgresOdmRow<SutItem>(collection, 'entry1', 'owner1', {title: 'tab A - typed first, saved later'})
    fromTabA.when_last_modified = new Date('2024-01-01T00:00:00.000Z').toISOString()

    const fromTabB = createPostgresOdmRow<SutItem>(collection, 'entry1', 'owner1', {title: 'tab B - typed second, saved first'})
    fromTabB.when_last_modified = new Date('2024-01-02T00:00:00.000Z').toISOString()

    // Tab B's edit reaches durable storage first (e.g. tab A was offline briefly), then tab A's
    // older-timestamped edit arrives.
    await tabB.put(fromTabB)
    await tabA.put(fromTabA)

    // Newer wins at the real key; older, different content is archived as a conflict - not
    // silently dropped, so the user can recover it - and tab A (whose write lost) is notified.
    const stored = await tabA.get<SutItem>(collection, 'entry1')
    expect(stored?.data.title).toBe('tab B - typed second, saved first')
    expect(conflictsSeenByTabA.length).toBe(1)
    expect(conflictsSeenByTabA[0].winnerId).toBe('entry1')
  })

  it('a live connection recovers automatically when another tab reloads after a deploy and bumps the schema version', async () => {
    const openTab = BrowserOdmStorage.forTesting(dbName)
    storagesToClose.push(openTab)
    const collection = 'JournalEntry'
    await openTab.put(createPostgresOdmRow<SutItem>(collection, 'entry1', 'owner1', {title: 'written before the deploy'}))

    const recoveries: void[] = []
    openTab.connectionRecovered$.subscribe(() => recoveries.push(undefined))

    // Simulates a second tab reloading after a deploy that bumped DB_VERSION: opening at a higher
    // version fires `versionchange` on openTab's still-live connection, exactly like a real
    // second tab would, without needing a second BrowserOdmStorage/second real tab at all.
    const reloadedTab = await openDb(DB_VERSION + 1, dbName)

    // openTab's onversionchange handler closes its stale connection and reconnects - give that
    // microtask/event chain a moment to run, same as the existing dead-connection recovery tests.
    await openTab.get(collection, 'missing')

    expect(recoveries.length).toBe(1)
    // The data written before the version bump must still be there after reconnecting - this is
    // the "no data loss across a deploy" guarantee Journal entries actually depend on.
    const stillThere = await openTab.get<SutItem>(collection, 'entry1')
    expect(stillThere?.data.title).toBe('written before the deploy')

    reloadedTab.close()
  })
})

// These exercise the real cascading migration logic inside openDb() directly (rather than through
// a whole BrowserOdmStorage instance, which always targets the shared production database name)
// against disposable, uniquely-named databases, so schema-upgrade scenarios never disturb - or get
// disturbed by - the tests above sharing 'lifesuite-odm-cache'.
describe('BrowserOdmStorage schema version upgrades (raw openDb, isolated databases)', () => {
  let dbName: string
  let dbsToClose: IDBDatabase[]

  function uniqueDbName(): string {
    return `BrowserOdmStorage_schema_test_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }

  function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  beforeEach(() => {
    dbName = uniqueDbName()
    dbsToClose = []
  })

  afterEach(async () => {
    dbsToClose.forEach(db => db.close())
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(dbName)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => resolve() // best-effort cleanup; never worth failing a test over
    })
  })

  it('a fresh database creates all stores plus the collection index', async () => {
    const db = await openDb(DB_VERSION, dbName)
    dbsToClose.push(db)

    expect(db.version).toBe(DB_VERSION)
    expect(db.objectStoreNames.contains(STORE)).toBe(true)
    expect(db.objectStoreNames.contains(SYNC_CURSORS_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(PENDING_EDITS_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(PENDING_BLOB_UPLOADS_STORE)).toBe(true)
    expect(db.objectStoreNames.contains(BLOB_CACHE_STORE)).toBe(true)
    expect(db.transaction(STORE, 'readonly').objectStore(STORE).indexNames.contains(COLLECTION_INDEX)).toBe(true)
  })

  it('upgrading from a legacy v3 database adds the blob stores without touching existing rows', async () => {
    const v3Db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 3)
      req.onupgradeneeded = (event) => {
        const db = req.result
        if (event.oldVersion < 1) {
          db.createObjectStore(STORE, {keyPath: 'key'}).createIndex(COLLECTION_INDEX, 'collection')
        }
        if (event.oldVersion < 2) {
          db.createObjectStore(SYNC_CURSORS_STORE, {keyPath: 'collection'})
          db.createObjectStore(PENDING_EDITS_STORE, {keyPath: 'key'})
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    await new Promise<void>((resolve, reject) => {
      const tx = v3Db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put({key: 'Foo::item1', collection: 'Foo', item_id: 'item1', data: {title: 'preserved'}})
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    v3Db.close()

    const upgradedDb = await openDb(DB_VERSION, dbName)
    dbsToClose.push(upgradedDb)

    expect(upgradedDb.objectStoreNames.contains(PENDING_BLOB_UPLOADS_STORE)).toBe(true)
    expect(upgradedDb.objectStoreNames.contains(BLOB_CACHE_STORE)).toBe(true)
    const preserved = await new Promise<any>((resolve, reject) => {
      const req = upgradedDb.transaction(STORE, 'readonly').objectStore(STORE).get('Foo::item1')
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    expect(preserved?.data?.title).toBe('preserved')
  })

  it('upgrading from a legacy v1 database (item store only) adds the newer stores without touching existing rows', async () => {
    // Hand-built to match exactly what v1-era code (before sync_cursors/pending_edits existed)
    // would have created - reusing today's openDb() with a low target version wouldn't reproduce
    // this, since its migration steps are gated only by oldVersion, not by the requested version,
    // so it would create every store immediately regardless of what version we ask for.
    const v1Db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 1)
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, {keyPath: 'key'}).createIndex(COLLECTION_INDEX, 'collection')
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    await requestToPromise(
      v1Db.transaction(STORE, 'readwrite').objectStore(STORE)
        .put({key: 'Foo::item1', collection: 'Foo', item_id: 'item1', data: {title: 'preserved'}})
    )
    v1Db.close()

    const upgradedDb = await openDb(DB_VERSION, dbName)
    dbsToClose.push(upgradedDb)

    expect(upgradedDb.objectStoreNames.contains(SYNC_CURSORS_STORE)).toBe(true)
    expect(upgradedDb.objectStoreNames.contains(PENDING_EDITS_STORE)).toBe(true)
    const preserved = await requestToPromise<any>(
      upgradedDb.transaction(STORE, 'readonly').objectStore(STORE).get('Foo::item1')
    )
    expect(preserved?.data?.title).toBe('preserved')
  })

  it('upgrading from v2 wipes any sync cursor written under the old buggy logic, leaving item rows and pending edits untouched', async () => {
    const v2Db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName, 2)
      req.onupgradeneeded = (event) => {
        const db = req.result
        if (event.oldVersion < 1) {
          db.createObjectStore(STORE, {keyPath: 'key'}).createIndex(COLLECTION_INDEX, 'collection')
        }
        if (event.oldVersion < 2) {
          db.createObjectStore(SYNC_CURSORS_STORE, {keyPath: 'collection'})
          db.createObjectStore(PENDING_EDITS_STORE, {keyPath: 'key'})
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    await requestToPromise(
      v2Db.transaction(SYNC_CURSORS_STORE, 'readwrite').objectStore(SYNC_CURSORS_STORE)
        .put({collection: 'Foo', cursor: 'buggy-cursor-from-limited-preview-fetch'})
    )
    await requestToPromise(
      v2Db.transaction(PENDING_EDITS_STORE, 'readwrite').objectStore(PENDING_EDITS_STORE)
        .put({key: 'Foo::item1', collection: 'Foo', item_id: 'item1', patch: {title: 'unsynced'}, whenLastModified: '2024-01-01T00:00:00.000Z'})
    )
    v2Db.close()

    const upgradedDb = await openDb(DB_VERSION, dbName)
    dbsToClose.push(upgradedDb)

    const cursorAfterUpgrade = await requestToPromise<any>(
      upgradedDb.transaction(SYNC_CURSORS_STORE, 'readonly').objectStore(SYNC_CURSORS_STORE).get('Foo')
    )
    expect(cursorAfterUpgrade).toBeUndefined()

    const pendingEditAfterUpgrade = await requestToPromise<any>(
      upgradedDb.transaction(PENDING_EDITS_STORE, 'readonly').objectStore(PENDING_EDITS_STORE).get('Foo::item1')
    )
    expect(pendingEditAfterUpgrade?.patch).toEqual({title: 'unsynced'})
  })

  it('reconnecting at "whatever version is already there" recovers after another tab already bumped past this bundle\'s DB_VERSION', async () => {
    // Simulates the exact scenario connect()'s VersionError catch handles: another tab reloaded
    // after a later deploy and already upgraded the schema past what this bundle's DB_VERSION
    // constant knows about. (Requesting DB_VERSION directly against it at that point would throw
    // a real VersionError, per the IndexedDB spec - that's the failure connect()'s catch exists
    // to recover from; not re-triggered here to avoid a real uncaught-exception console error
    // from an intentionally-unhandled browser-level event during the test run.)
    const futureDb = await openDb(DB_VERSION + 1, dbName)
    futureDb.close()

    const recovered = await openDb(undefined, dbName)
    dbsToClose.push(recovered)
    expect(recovered.version).toBe(DB_VERSION + 1)
  })
})
