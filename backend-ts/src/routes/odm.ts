import { Hono } from 'hono';
import postgres from 'postgres';
import type { OdmSaveRequest, OdmDeleteRequest } from '../types.js';

export const odmRouter = new Hono();

let _sql: ReturnType<typeof postgres> | null = null;

function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    const url = process.env['ODM_DATABASE_URL'] ?? process.env['DATABASE_URL'];
    if (!url) throw new Error('ODM_DATABASE_URL not configured');
    _sql = postgres(url, { ssl: { rejectUnauthorized: false } });
  }
  return _sql;
}

async function ensureTables() {
  if (!process.env['ODM_ENSURE_TABLES']) return;
  const sql = getSql();
  await sql`
    create table if not exists public.lifesuite_odm_items (
      collection text not null,
      item_id text not null,
      owner text not null,
      data jsonb not null default '{}'::jsonb,
      parent_ids text[] not null default '{}',
      ancestor_ids text[] not null default '{}',
      when_last_modified timestamptz not null default now(),
      when_deleted timestamptz,
      primary key (collection, item_id)
    )
  `;
  await sql`
    create index if not exists lifesuite_odm_items_owner_idx
      on public.lifesuite_odm_items (owner, collection, when_last_modified desc)
  `;
  await sql`
    create table if not exists public.lifesuite_odm_item_history (
      history_id text primary key,
      collection text not null,
      item_id text not null,
      owner text not null,
      data jsonb not null default '{}'::jsonb,
      parent_ids text[] not null default '{}',
      ancestor_ids text[] not null default '{}',
      snapshot_at timestamptz not null default now()
    )
  `;
}

odmRouter.get('/api/odm/items', async c => {
  const collection = c.req.query('collection') ?? '';
  const owner = c.req.query('owner') ?? '';
  const parentId = c.req.query('parentId');
  const ancestorId = c.req.query('ancestorId');
  const limitStr = c.req.query('limit');
  const limit = limitStr ? Math.min(parseInt(limitStr, 10), 1000) : null;

  if (!collection || !owner) return c.json({ error: 'collection and owner required' }, 400);

  await ensureTables();
  const sql = getSql();

  // Build dynamic query
  const rows = await sql`
    select collection, item_id, owner, data, parent_ids, ancestor_ids, when_deleted, when_last_modified
    from public.lifesuite_odm_items
    where collection = ${collection}
      and owner = ${owner}
      and when_deleted is null
      ${parentId ? sql`and parent_ids @> array[${parentId}]::text[]` : sql``}
      ${ancestorId ? sql`and ancestor_ids @> array[${ancestorId}]::text[]` : sql``}
    order by when_last_modified desc
    ${limit !== null ? sql`limit ${limit}` : sql``}
  `;

  const items = rows.map(row => ({
    collection: row['collection'],
    item_id: row['item_id'],
    owner: row['owner'],
    data: row['data'],
    parent_ids: row['parent_ids'] ?? [],
    ancestor_ids: row['ancestor_ids'] ?? [],
    when_deleted: row['when_deleted'] ? row['when_deleted'].toISOString() : null,
    when_last_modified: row['when_last_modified'] ? row['when_last_modified'].toISOString() : null,
  }));

  return c.json({ items });
});

odmRouter.put('/api/odm/items/:collection/:item_id', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmSaveRequest>();

  await ensureTables();
  const sql = getSql();

  if (body.storeVersionHistory) {
    const historyId = `${item_id}_${crypto.randomUUID()}`;
    await sql`
      insert into public.lifesuite_odm_item_history
        (history_id, collection, item_id, owner, data, parent_ids, ancestor_ids)
      values (
        ${historyId}, ${collection}, ${item_id}, ${body.owner},
        ${sql.json(body.data as Parameters<typeof sql.json>[0])}, ${body.parentIds}, ${body.ancestorIds}
      )
    `;
  }

  await sql`
    insert into public.lifesuite_odm_items
      (collection, item_id, owner, data, parent_ids, ancestor_ids, when_last_modified, when_deleted)
    values (
      ${collection}, ${item_id}, ${body.owner},
      ${sql.json(body.data as Parameters<typeof sql.json>[0])}, ${body.parentIds}, ${body.ancestorIds}, now(), null
    )
    on conflict (collection, item_id) do update set
      owner = excluded.owner,
      data = excluded.data,
      parent_ids = excluded.parent_ids,
      ancestor_ids = excluded.ancestor_ids,
      when_last_modified = now(),
      when_deleted = null
  `;

  return c.json({ ok: true });
});

odmRouter.post('/api/odm/items/:collection/:item_id/delete', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmDeleteRequest>();

  await ensureTables();
  const sql = getSql();

  await sql`
    update public.lifesuite_odm_items
    set when_deleted = now(), when_last_modified = now()
    where collection = ${collection} and item_id = ${item_id} and owner = ${body.owner}
  `;

  return c.json({ ok: true });
});
