import {describe, it, expect, beforeEach} from 'vitest'
import {BrowserOdmStorage} from './BrowserOdmStorage'
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
})
