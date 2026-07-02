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
