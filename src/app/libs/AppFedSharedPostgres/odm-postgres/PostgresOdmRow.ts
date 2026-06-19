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
}

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
