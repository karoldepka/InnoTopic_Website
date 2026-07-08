import {describe, expect, it, vi} from 'vitest'
import {OrySubtreeSharesService} from './ory-subtree-shares.service'

/** Minimal fake of supabase-js's chainable, thenable query builder - just enough to exercise
 * insert/select/eq/order/delete against an in-memory array, without needing a real Supabase
 * project or network access. Every step (not just the terminal one) is itself awaitable, matching
 * how supabase-js's PostgrestFilterBuilder actually behaves. */
class FakeQueryBuilder<T extends {id: string}> implements PromiseLike<{data: T[] | null, error: any}> {
  private filters: Array<(row: T) => boolean> = []
  private sortKey?: keyof T
  private sortAscending = true
  private mode: 'select' | 'delete' = 'select'

  constructor(private table: T[], private tableError: any) {
  }

  eq(column: keyof T, value: any): this {
    this.filters.push(row => row[column] === value)
    return this
  }

  order(column: keyof T, opts: {ascending: boolean}): this {
    this.sortKey = column
    this.sortAscending = opts.ascending
    return this
  }

  delete(): this {
    this.mode = 'delete'
    return this
  }

  then<TResult1, TResult2>(
    onfulfilled?: (value: {data: T[] | null, error: any}) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>,
  ): PromiseLike<TResult1 | TResult2> {
    const result = this.resolve()
    return Promise.resolve(result).then(onfulfilled as any, onrejected as any)
  }

  private resolve(): {data: T[] | null, error: any} {
    if (this.tableError) {
      return {data: null, error: this.tableError}
    }
    let matching = this.table.filter(row => this.filters.every(f => f(row)))
    if (this.mode === 'delete') {
      for (const row of matching) {
        this.table.splice(this.table.indexOf(row), 1)
      }
      return {data: matching, error: null}
    }
    if (this.sortKey) {
      const key = this.sortKey
      matching = [...matching].sort((a, b) => this.sortAscending
        ? (a[key] > b[key] ? 1 : -1)
        : (a[key] < b[key] ? 1 : -1))
    }
    return {data: matching, error: null}
  }
}

function createFakeSupabaseClient<T extends {id: string}>(table: T[], insertedRows: any[], tableError: any = null) {
  let nextId = 1
  return {
    from: (_tableName: string) => ({
      insert: (row: any) => {
        insertedRows.push(row)
        if (!tableError) {
          table.push({...row, id: `generated-${nextId++}`, created_at: new Date().toISOString()})
        }
        return new FakeQueryBuilder(table, tableError)
      },
      select: (_cols: string) => new FakeQueryBuilder(table, tableError),
      delete: () => new FakeQueryBuilder(table, tableError).delete(),
    }),
  }
}

describe('OrySubtreeSharesService', () => {
  function build(table: any[] = [], tableError: any = null) {
    const insertedRows: any[] = []
    const fakeClient = createFakeSupabaseClient(table, insertedRows, tableError)
    const supabaseClient = {getClient: () => fakeClient} as any
    const authService = {authUser$: {lastVal: {uid: 'owner-uid-1'}}} as any
    const service = new OrySubtreeSharesService(supabaseClient, authService)
    return {service, table, insertedRows, authService}
  }

  it('grantShare inserts a row stamped with the current uid as granted_by_uid', async () => {
    const {service, insertedRows} = build()

    await service.grantShare('item1', 'recipient-uid', 'read')

    expect(insertedRows).toEqual([{
      subtree_root_item_id: 'item1',
      granted_to_uid: 'recipient-uid',
      granted_by_uid: 'owner-uid-1',
      permission: 'read',
    }])
  })

  it('grantShare throws without ever calling the client if nobody is signed in', async () => {
    const {service, authService, insertedRows} = build()
    authService.authUser$.lastVal = undefined

    await expect(service.grantShare('item1', 'recipient-uid', 'write')).rejects.toThrow('Not signed in.')
    expect(insertedRows).toEqual([])
  })

  it('grantShare propagates a server/RLS error (e.g. granting a share for a subtree you do not own)', async () => {
    const {service} = build([], {message: 'new row violates row-level security policy'})

    await expect(service.grantShare('item1', 'recipient-uid', 'write')).rejects.toEqual({
      message: 'new row violates row-level security policy',
    })
  })

  it('listSharesForSubtree only returns shares for that specific subtree', async () => {
    const {service, table} = build()
    table.push(
      {id: 's1', subtree_root_item_id: 'item1', granted_to_uid: 'u1', granted_to_group_id: null, granted_by_uid: 'owner-uid-1', permission: 'read', created_at: '2026-01-01T00:00:00.000Z'},
      {id: 's2', subtree_root_item_id: 'item2', granted_to_uid: 'u2', granted_to_group_id: null, granted_by_uid: 'owner-uid-1', permission: 'write', created_at: '2026-01-02T00:00:00.000Z'},
    )

    const shares = await service.listSharesForSubtree('item1')

    expect(shares.map(s => s.id)).toEqual(['s1'])
  })

  it('revokeShare removes exactly the matching row', async () => {
    const {service, table} = build()
    table.push(
      {id: 's1', subtree_root_item_id: 'item1', granted_to_uid: 'u1', granted_to_group_id: null, granted_by_uid: 'owner-uid-1', permission: 'read', created_at: '2026-01-01T00:00:00.000Z'},
      {id: 's2', subtree_root_item_id: 'item1', granted_to_uid: 'u2', granted_to_group_id: null, granted_by_uid: 'owner-uid-1', permission: 'write', created_at: '2026-01-01T00:00:00.000Z'},
    )

    await service.revokeShare('s1')

    expect(table.map(r => r.id)).toEqual(['s2'])
  })

  it('revokeShare propagates a server/RLS error (e.g. revoking a share you did not grant)', async () => {
    const {service} = build([], {message: 'permission denied'})

    await expect(service.revokeShare('s1')).rejects.toEqual({message: 'permission denied'})
  })
})
