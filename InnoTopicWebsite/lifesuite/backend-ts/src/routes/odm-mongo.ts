import { Hono } from 'hono';
import dns from 'node:dns';
import { MongoClient, type Collection, type Db } from 'mongodb';
import type { OdmSaveRequest, OdmDeleteRequest } from '../types.js';

// mongodb+srv:// needs a DNS SRV/TXT lookup before it can connect - Node's c-ares resolver can't
// complete that against whatever DNS server this host is configured to use (fails with
// `querySrv ECONNREFUSED`), even though the OS's own resolver handles the same lookup fine. This
// swaps only Node's resolver (not the OS's) to a public one so the srv:// lookup can succeed.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export const odmMongoRouter = new Hono();

interface OdmMongoDoc {
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
    _indexesEnsured = (async () => {
      await itemsCollection().createIndex({ collection: 1, id: 1 }, { unique: true });
      await itemsCollection().createIndex({ owner: 1, collection: 1, when_last_modified: -1 });
      await itemsCollection().createIndex({ collection: 1, parent_ids: 1 });
      await itemsCollection().createIndex({ collection: 1, ancestor_ids: 1 });
    })();
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

odmMongoRouter.get('/api/odm-mongo/items', async c => {
  const collection = c.req.query('collection') ?? '';
  const owner = c.req.query('owner') ?? '';
  const parentId = c.req.query('parentId');
  const ancestorId = c.req.query('ancestorId');
  const limitStr = c.req.query('limit');
  const limit = limitStr ? Math.min(parseInt(limitStr, 10), 1000) : null;

  if (!collection || !owner) return c.json({ error: 'collection and owner required' }, 400);

  await ensureIndexes();

  const query: Record<string, unknown> = { collection, owner, when_deleted: null };
  if (parentId) query['parent_ids'] = parentId;
  if (ancestorId) query['ancestor_ids'] = ancestorId;

  let cursor = itemsCollection().find(query).sort({ when_last_modified: -1 });
  if (limit !== null) cursor = cursor.limit(limit);
  const docs = await cursor.toArray();

  return c.json({ items: docs.map(toItemJson) });
});

odmMongoRouter.put('/api/odm-mongo/items/:collection/:item_id', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmSaveRequest>();

  await ensureIndexes();

  if (body.storeVersionHistory) {
    await historyCollection().insertOne({
      history_id: `${item_id}_${crypto.randomUUID()}`,
      collection,
      item_id,
      owner: body.owner,
      data: body.data,
      parent_ids: body.parentIds,
      ancestor_ids: body.ancestorIds,
      snapshot_at: new Date(),
    });
  }

  await itemsCollection().updateOne(
    { collection, id: item_id },
    {
      $set: {
        owner: body.owner,
        data: body.data,
        parent_ids: body.parentIds,
        ancestor_ids: body.ancestorIds,
        when_last_modified: new Date(),
        when_deleted: null,
      },
    },
    { upsert: true },
  );

  return c.json({ ok: true });
});

odmMongoRouter.post('/api/odm-mongo/items/:collection/:item_id/delete', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmDeleteRequest>();

  await ensureIndexes();

  await itemsCollection().updateOne(
    { collection, id: item_id, owner: body.owner },
    { $set: { when_deleted: new Date(), when_last_modified: new Date() } },
  );

  return c.json({ ok: true });
});
