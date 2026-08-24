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
  /** The ODM item id is unique within this OdmItem$ subclass's Mongo collection. */
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
const indexesEnsuredByCollection = new Map<string, Promise<void>>();

function getDb(): Db {
  if (!_db) {
    const uri = process.env['MONGODB_URI'];
    if (!uri) throw new Error('MONGODB_URI not configured');
    _client = new MongoClient(uri);
    _db = _client.db(process.env['MONGODB_DB_NAME'] ?? 'lifesuite');
  }
  return _db;
}

/** Each OdmItem$ subclass is isolated in its own Mongo collection, named after its ODM class
 * (for example `JournalEntry`, `LearnItem`, or `OryItem`). */
function itemsCollection(collection: string): Collection<OdmMongoDoc> {
  return getDb().collection<OdmMongoDoc>(collection);
}

function historyCollection(collection: string): Collection<OdmMongoHistoryDoc> {
  return getDb().collection<OdmMongoHistoryDoc>(`${collection}_history`);
}

async function ensureIndexes(collection: string): Promise<void> {
  let indexesEnsured = indexesEnsuredByCollection.get(collection);
  if (!indexesEnsured) {
    indexesEnsured = (async () => {
      const items = itemsCollection(collection);
      await items.createIndex({ owner: 1, when_last_modified: -1 });
      await items.createIndex({ owner: 1, parent_ids: 1 });
      await items.createIndex({ owner: 1, ancestor_ids: 1 });
    })();
    indexesEnsuredByCollection.set(collection, indexesEnsured);
    indexesEnsured.catch(() => { indexesEnsuredByCollection.delete(collection); });
  }
  return indexesEnsured;
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

  if (history.length) await historyCollection(collection).insertMany(history);

  if (!items.length) return;
  await itemsCollection(collection).bulkWrite(items.map(item => ({
    updateOne: {
      filter: { _id: item.item_id },
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

  await ensureIndexes(collection);

  const query: Record<string, unknown> = { owner, when_deleted: null };
  if (parentId) query['parent_ids'] = parentId;
  if (ancestorId) query['ancestor_ids'] = ancestorId;

  // Fetch one extra document so callers can page without an additional count query.
  const docs = await itemsCollection(collection)
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

  await ensureIndexes(collection);
  await saveItems(collection, body.owner, items);
  if (deleteItemIds.length) {
    const now = new Date();
    await itemsCollection(collection).updateMany(
      { _id: { $in: deleteItemIds }, owner: body.owner },
      { $set: { when_deleted: now, when_last_modified: now } },
    );
  }

  return c.json({ ok: true, saved: items.length, deleted: deleteItemIds.length });
});

odmMongoRouter.put('/api/odm-mongo/items/:collection/:item_id', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmSaveRequest>();

  await ensureIndexes(collection);

  await saveItems(collection, body.owner, [{ ...body, item_id }]);

  return c.json({ ok: true });
});

odmMongoRouter.post('/api/odm-mongo/items/:collection/:item_id/delete', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmDeleteRequest>();

  await ensureIndexes(collection);

  await itemsCollection(collection).updateOne(
    { _id: item_id, owner: body.owner },
    { $set: { when_deleted: new Date(), when_last_modified: new Date() } },
  );

  return c.json({ ok: true });
});
