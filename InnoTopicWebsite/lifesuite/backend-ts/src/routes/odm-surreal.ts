import { Hono } from 'hono';
import { Surreal } from 'surrealdb';
import type { OdmSaveRequest, OdmDeleteRequest } from '../types.js';

export const odmSurrealRouter = new Hono();

interface OdmSurrealDoc {
  collection: string;
  item_id: string;
  owner: string;
  data: Record<string, unknown>;
  parent_ids: string[];
  ancestor_ids: string[];
  when_last_modified: string;
  when_deleted: string | null;
}

let _db: Surreal | null = null;
let _connecting: Promise<Surreal> | null = null;

/** SurrealDB's own record `id` field is reserved for its Record ID (table:id) - storing a plain
 * `id` field alongside it would collide, so the item's own id is kept as `item_id` throughout,
 * matching the response shape the Postgres/Mongo ODM routes already use. The Record ID itself is
 * built from `collection`+`item_id` via type::record() below, which gives natural per-item
 * uniqueness for free - no separate unique index needed the way Mongo's odm_items required one. */
function recordIdPart(collection: string, itemId: string): string {
  return `${collection}::${itemId}`;
}

function getDb(): Promise<Surreal> {
  if (_db) return Promise.resolve(_db);
  if (!_connecting) {
    // A failed attempt must not stick around as a permanently-rejected promise - every request
    // after a transient failure (SurrealDB briefly unreachable, etc.) would otherwise fail forever
    // until the whole process restarts, since nothing here ever overwrites _connecting again once
    // it's set. Clearing it on rejection lets the next call retry from scratch instead.
    _connecting = (async () => {
      const url = process.env['SURREALDB_URL'];
      const username = process.env['SURREALDB_USER'];
      const password = process.env['SURREALDB_PASS'];
      if (!url || !username || !password) throw new Error('SURREALDB_URL/SURREALDB_USER/SURREALDB_PASS not configured');
      const db = new Surreal();
      await db.connect(url, {
        namespace: process.env['SURREALDB_NS'] ?? 'lifesuite',
        database: process.env['SURREALDB_DB'] ?? 'lifesuite',
        authentication: { username, password },
      });
      _db = db;
      return db;
    })();
    _connecting.catch(() => { _connecting = null; });
  }
  return _connecting;
}

function toItemJson(doc: OdmSurrealDoc) {
  return {
    collection: doc.collection,
    item_id: doc.item_id,
    owner: doc.owner,
    data: doc.data,
    parent_ids: doc.parent_ids ?? [],
    ancestor_ids: doc.ancestor_ids ?? [],
    when_deleted: doc.when_deleted ?? null,
    when_last_modified: doc.when_last_modified ?? null,
  };
}

odmSurrealRouter.get('/api/odm-surreal/items', async c => {
  const collection = c.req.query('collection') ?? '';
  const owner = c.req.query('owner') ?? '';
  const parentId = c.req.query('parentId');
  const ancestorId = c.req.query('ancestorId');
  const limitStr = c.req.query('limit');
  const limit = limitStr ? Math.min(parseInt(limitStr, 10), 1000) : 1000;

  if (!collection || !owner) return c.json({ error: 'collection and owner required' }, 400);

  const db = await getDb();
  // Deliberately `IS NULL`, not `IS NONE` - SurrealDB treats those as distinct (NONE = field
  // absent, NULL = field present with no value), and every row here always has when_deleted
  // explicitly set to either null (not deleted) or a timestamp string, never left absent.
  let query = 'SELECT * FROM odm_items WHERE collection = $collection AND owner = $owner AND when_deleted IS NULL';
  const bindings: Record<string, unknown> = { collection, owner, limit };
  if (parentId) {
    query += ' AND $parentId IN parent_ids';
    bindings['parentId'] = parentId;
  }
  if (ancestorId) {
    query += ' AND $ancestorId IN ancestor_ids';
    bindings['ancestorId'] = ancestorId;
  }
  query += ' ORDER BY when_last_modified DESC LIMIT $limit';

  const [rows] = await db.query<[OdmSurrealDoc[]]>(query, bindings);
  return c.json({ items: (rows ?? []).map(toItemJson) });
});

odmSurrealRouter.put('/api/odm-surreal/items/:collection/:item_id', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmSaveRequest>();
  const db = await getDb();
  const now = new Date().toISOString();

  if (body.storeVersionHistory) {
    await db.query('CREATE odm_item_history CONTENT $doc', {
      doc: {
        history_id: `${item_id}_${crypto.randomUUID()}`,
        collection,
        item_id,
        owner: body.owner,
        data: body.data,
        parent_ids: body.parentIds,
        ancestor_ids: body.ancestorIds,
        snapshot_at: now,
      },
    });
  }

  await db.query('UPSERT type::record("odm_items", $rid) MERGE $doc', {
    rid: recordIdPart(collection, item_id),
    doc: {
      collection,
      item_id,
      owner: body.owner,
      data: body.data,
      parent_ids: body.parentIds,
      ancestor_ids: body.ancestorIds,
      when_last_modified: now,
      when_deleted: null,
    },
  });

  return c.json({ ok: true });
});

odmSurrealRouter.post('/api/odm-surreal/items/:collection/:item_id/delete', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmDeleteRequest>();
  const db = await getDb();
  const now = new Date().toISOString();

  await db.query('UPDATE type::record("odm_items", $rid) SET when_deleted = $now, when_last_modified = $now WHERE owner = $owner', {
    rid: recordIdPart(collection, item_id),
    owner: body.owner,
    now,
  });

  return c.json({ ok: true });
});
