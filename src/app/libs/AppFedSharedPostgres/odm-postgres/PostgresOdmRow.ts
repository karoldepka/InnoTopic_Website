import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import {ItemId} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'

export interface PostgresOdmRow<TRaw> {
  collection: string
  item_id: string
  owner: string
  data: TRaw
  parent_ids?: ItemId[] | null
  ancestor_ids?: ItemId[] | null
  when_deleted?: string | null
  when_last_modified?: string | null
  /** Postgres-set only (default now() on insert, forced by trigger on update) - the
   * authoritative sync-cursor watermark, never written by the client. See
   * docs/odm-incremental-sync-plan.md. */
  server_modified_at?: string | null
  /** Postgres-set only (GH #89's `whenDescendantLastModified` rollup - see the
   * `trg_bump_when_descendant_last_modified` trigger) - deliberately never written by the client,
   * see `createPostgresOdmRow()`'s doc comment. */
  when_descendant_last_modified?: string | null
}

/** Note: `item`'s own `whenDescendantLastModified` (if the in-memory object happens to carry a
 * locally-optimistic value - see `OdmItem$2.bumpAncestorsWhenDescendantLastModifiedLocally()`) is
 * deliberately NOT promoted into the dedicated `when_descendant_last_modified` column here - that
 * column is exclusively written by the `trg_bump_when_descendant_last_modified` DB trigger. If a
 * client ever sent it directly, a stale locally-cached value could regress the authoritative
 * server-computed one (e.g. another device already pushed it further ahead via its own edit). */
export function createPostgresOdmRow<TRaw>(
  collectionName: string,
  id: OdmItemId | string,
  owner: string,
  item: TRaw,
  parentIds?: ItemId[],
  ancestorIds?: ItemId[],
): PostgresOdmRow<TRaw> {
  const itemAsAny = item as any
  return {
    collection: collectionName,
    item_id: id as string,
    owner,
    data: item,
    parent_ids: parentIds ?? itemAsAny?.parentIds ?? [],
    ancestor_ids: ancestorIds ?? itemAsAny?.ancestorIds ?? [],
    when_last_modified: timestampLikeToIsoString(itemAsAny?.whenLastModified) ?? new Date().toISOString(),
    when_deleted: null,
  }
}

export function rawFromPostgresOdmRow<TRaw>(row: PostgresOdmRow<TRaw>): TRaw {
  const data = reviveFirestoreTimestamps({
    ...(row.data as any),
    parentIds: row.parent_ids ?? (row.data as any)?.parentIds ?? [],
    ancestorIds: row.ancestor_ids ?? (row.data as any)?.ancestorIds ?? [],
    // The real column (server-authoritative) always wins over whatever's nested in `data` (e.g. a
    // stale locally-optimistic value echoed back from a prior client write - see the doc comment
    // on createPostgresOdmRow() above).
    whenDescendantLastModified: row.when_descendant_last_modified ?? (row.data as any)?.whenDescendantLastModified,
  })
  return data as TRaw
}

export function timestampLikeToIsoString(value: any): string | undefined {
  if (!value) {
    return undefined
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  if (typeof value.seconds === 'number') {
    const millis = value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1000000)
    return new Date(millis).toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return undefined
}

function reviveFirestoreTimestamps(value: any): any {
  if (Array.isArray(value)) {
    return value.map(reviveFirestoreTimestamps)
  }
  if (!value || typeof value !== 'object') {
    return value
  }
  if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
    return new firebase.firestore.Timestamp(value.seconds, value.nanoseconds)
  }
  const revived: any = {}
  for (const key of Object.keys(value)) {
    revived[key] = reviveFirestoreTimestamps(value[key])
  }
  return revived
}
