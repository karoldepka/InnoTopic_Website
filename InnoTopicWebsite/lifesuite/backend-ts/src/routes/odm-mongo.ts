import { Hono } from 'hono';
import dns from 'node:dns';
import { MongoClient, type Collection, type Db } from 'mongodb';
import type { OdmSaveRequest, OdmDeleteRequest, OdmBatchRequest } from '../types.js';

// mongodb+srv:// needs a DNS SRV/TXT lookup before it can connect - Node's c-ares resolver can't
// complete that against whatever DNS server this host is configured to use (fails with
// `querySrv ECONNREFUSED`), even though the OS's own resolver handles the same lookup fine. This
// swaps only Node's resolver (not the OS's) to a public one so the srv:// lookup can succeed.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export const odmMongoRouter = new Hono();

/** Keeps an individual HTTP payload and MongoDB bulk operation comfortably bounded. */
const ODM_BATCH_SIZE = 200;

interface OdmMongoDoc {
  /** Deterministic (collection, id) composite - see idForItem() - so an upsert is a true upsert:
   * MongoDB's own primary key already guarantees no two documents can ever share one, with no
   * separate unique index (and the creation-order race that comes with one) required. */
  _id: string;
  collection: string;
  id: string;
  owner: string;
  data: Record<string, unknown>;
  parent_ids: string[];
  ancestor_ids: string[];
  when_last_modified: Date;
  when_deleted: Date | null;
}

/** Same composite-key idea as odm-surreal.ts's recordIdPart() - deliberately keeping the two
 * peers' natural-key formats independent (each is an internal implementation detail of its own
 * store, never compared to the other), just reusing the same "table:id" `::` convention. */
function idForItem(collection: string, itemId: string): string {
  return `${collection}::${itemId}`;
}

interface OdmMongoHistoryDoc {
  history_id: string;
  collection: string;
  item_id: string;
  owner: string;
  data: Record<string, unknown>;
  parent_ids: string[];
  ancestor_ids: string[];
  snapshot_at: Date;
}

let _client: MongoClient | null = null;
let _db: Db | null = null;
let _indexesEnsured: Promise<void> | null = null;

function getDb(): Db {
  if (!_db) {
    const uri = process.env['MONGODB_URI'];
    if (!uri) throw new Error('MONGODB_URI not configured');
    _client = new MongoClient(uri);
    _db = _client.db(process.env['MONGODB_DB_NAME'] ?? 'lifesuite');
  }
  return _db;
}

function itemsCollection(): Collection<OdmMongoDoc> {
  return getDb().collection<OdmMongoDoc>('odm_items');
}

function historyCollection(): Collection<OdmMongoHistoryDoc> {
  return getDb().collection<OdmMongoHistoryDoc>('odm_item_history');
}

async function ensureIndexes(): Promise<void> {
  if (!_indexesEnsured) {
    // No unique index on (collection, id) here - _id itself is that composite key now (see
    // idForItem()), so uniqueness is enforced by MongoDB's own primary key with no separate index
    // to create (and no window between "server starts accepting writes" and "that index finishes
    // building" where a race could still slip a duplicate through).
    _indexesEnsured = (async () => {
      await itemsCollection().createIndex({ owner: 1, collection: 1, when_last_modified: -1 });
      await itemsCollection().createIndex({ collection: 1, parent_ids: 1 });
      await itemsCollection().createIndex({ collection: 1, ancestor_ids: 1 });
    })();
    _indexesEnsured.catch(() => { _indexesEnsured = null; });
  }
  return _indexesEnsured;
}

function toItemJson(doc: OdmMongoDoc) {
  return {
    collection: doc.collection,
    item_id: doc.id,
    owner: doc.owner,
    data: doc.data,
    parent_ids: doc.parent_ids ?? [],
    ancestor_ids: doc.ancestor_ids ?? [],
    when_deleted: doc.when_deleted ? doc.when_deleted.toISOString() : null,
    when_last_modified: doc.when_last_modified ? doc.when_last_modified.toISOString() : null,
  };
}

async function saveItems(
  collection: string,
  owner: string,
  items: Array<OdmSaveRequest & { item_id: string }>,
): Promise<void> {
  const now = new Date();
  const history = items
    .filter(item => item.storeVersionHistory)
    .map(item => ({
      history_id: `${item.item_id}_${crypto.randomUUID()}`,
      collection,
      item_id: item.item_id,
      owner,
      data: item.data,
      parent_ids: item.parentIds,
      ancestor_ids: item.ancestorIds,
      snapshot_at: now,
    }));

  if (history.length) await historyCollection().insertMany(history);

  if (!items.length) return;
  await itemsCollection().bulkWrite(items.map(item => ({
    updateOne: {
      filter: { _id: idForItem(collection, item.item_id) },
      update: {
        $set: {
          collection,
          id: item.item_id,
          owner,
          data: item.data,
          parent_ids: item.parentIds,
          ancestor_ids: item.ancestorIds,
          when_last_modified: now,
          when_deleted: null,
        },
      },
      upsert: true,
    },
  })));
}

odmMongoRouter.get('/api/odm-mongo/items', async c => {
  const collection = c.req.query('collection') ?? '';
  const owner = c.req.query('owner') ?? '';
  const parentId = c.req.query('parentId');
  const ancestorId = c.req.query('ancestorId');
  const limitStr = c.req.query('limit');
  const requestedLimit = limitStr ? Math.min(Math.max(parseInt(limitStr, 10) || ODM_BATCH_SIZE, 1), ODM_BATCH_SIZE) : ODM_BATCH_SIZE;
  const offset = Math.max(parseInt(c.req.query('offset') ?? '0', 10) || 0, 0);

  if (!collection || !owner) return c.json({ error: 'collection and owner required' }, 400);

  await ensureIndexes();

  const query: Record<string, unknown> = { collection, owner, when_deleted: null };
  if (parentId) query['parent_ids'] = parentId;
  if (ancestorId) query['ancestor_ids'] = ancestorId;

  // Fetch one extra document so callers can page without an additional count query.
  const docs = await itemsCollection()
    .find(query)
    .sort({ when_last_modified: -1, _id: 1 })
    .skip(offset)
    .limit(requestedLimit + 1)
    .toArray();

  const hasMore = docs.length > requestedLimit;
  return c.json({ items: docs.slice(0, requestedLimit).map(toItemJson), hasMore });
});

odmMongoRouter.post('/api/odm-mongo/items/:collection/batch', async c => {
  const collection = c.req.param('collection');
  const body = await c.req.json<OdmBatchRequest>();
  const items = body.items ?? [];
  const deleteItemIds = body.deleteItemIds ?? [];

  if (!body.owner || (!items.length && !deleteItemIds.length)) {
    return c.json({ error: 'owner and at least one item mutation are required' }, 400);
  }
  if (items.length + deleteItemIds.length > ODM_BATCH_SIZE) {
    return c.json({ error: `at most ${ODM_BATCH_SIZE} item mutations per batch` }, 413);
  }

  await ensureIndexes();
  await saveItems(collection, body.owner, items);
  if (deleteItemIds.length) {
    const now = new Date();
    await itemsCollection().updateMany(
      { _id: { $in: deleteItemIds.map(itemId => idForItem(collection, itemId)) }, owner: body.owner },
      { $set: { when_deleted: now, when_last_modified: now } },
    );
  }

  return c.json({ ok: true, saved: items.length, deleted: deleteItemIds.length });
});

odmMongoRouter.put('/api/odm-mongo/items/:collection/:item_id', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmSaveRequest>();

  await ensureIndexes();

  await saveItems(collection, body.owner, [{ ...body, item_id }]);

  return c.json({ ok: true });
});

odmMongoRouter.post('/api/odm-mongo/items/:collection/:item_id/delete', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmDeleteRequest>();

  await ensureIndexes();

  await itemsCollection().updateOne(
    { _id: idForItem(collection, item_id), owner: body.owner },
    { $set: { when_deleted: new Date(), when_last_modified: new Date() } },
  );

  return c.json({ ok: true });
});
