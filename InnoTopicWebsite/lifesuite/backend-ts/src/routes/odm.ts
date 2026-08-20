import { Hono } from 'hono';
import postgres from 'postgres';
import type { OdmSaveRequest, OdmDeleteRequest, OdmSearchRequest, EmbeddingRequest, EmbeddingBatchRequest } from '../types.js';
import { createEmbedding, createEmbeddings, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, toPgVector } from '../embeddings.js';

export const odmRouter = new Hono();

odmRouter.post('/api/embeddings', async c => {
  const body = await c.req.json<EmbeddingRequest>();
  if (!body.text?.trim()) return c.json({ error: 'text required' }, 400);

  const embedding = await createEmbedding(body.text);
  return c.json({ embedding, model: EMBEDDING_MODEL, dimensions: EMBEDDING_DIMENSIONS });
});

async function handleEmbeddingBatch(c: import('hono').Context) {
  const body = await c.req.json<EmbeddingBatchRequest>();
  if (!Array.isArray(body.texts) || !body.texts.length) return c.json({ error: 'texts required' }, 400);
  if (body.texts.length > 100) return c.json({ error: 'at most 100 texts per request' }, 400);

  const embeddings = await createEmbeddings(body.texts);
  return c.json({ embeddings, model: EMBEDDING_MODEL, dimensions: EMBEDDING_DIMENSIONS });
}

odmRouter.post('/api/embeddings/batch', handleEmbeddingBatch);
odmRouter.post('/ai-api/embeddings/batch', handleEmbeddingBatch);

let _sql: ReturnType<typeof postgres> | null = null;
let ensureTablesPromise: Promise<void> | null = null;

export function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    const url = process.env['ODM_DATABASE_URL'] ?? process.env['DATABASE_URL'];
    if (!url) throw new Error('ODM_DATABASE_URL not configured');
    _sql = postgres(url, { ssl: { rejectUnauthorized: false } });
  }
  return _sql;
}

export async function ensureTables() {
  if (!process.env['ODM_ENSURE_TABLES']) return;
  if (ensureTablesPromise) return ensureTablesPromise;

  ensureTablesPromise = (async () => {
    const sql = getSql();
    await sql`
      create table if not exists public.odm_items (
        collection text not null,
        id text not null,
        owner text not null,
        data jsonb not null default '{}'::jsonb,
        parent_ids text[] not null default '{}',
        ancestor_ids text[] not null default '{}',
        when_last_modified timestamptz not null default now(),
        when_deleted timestamptz,
        primary key (collection, id)
      )
    `;
    await sql`
      create index if not exists odm_items_owner_idx
        on public.odm_items (owner, collection, when_last_modified desc)
    `;
    await sql`create extension if not exists vector`;
    await sql`alter table public.odm_items add column if not exists embedding vector(768)`;
    await sql`alter table public.odm_items add column if not exists embedding_text text`;
    await sql`alter table public.odm_items add column if not exists embedding_model text`;
    await sql`
      create index if not exists odm_items_embedding_hnsw_idx
        on public.odm_items using hnsw (embedding vector_cosine_ops)
        where embedding is not null and when_deleted is null
    `;
    await sql`
      create table if not exists public.odm_item_history (
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
  })();

  return ensureTablesPromise;
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
    select collection, id as item_id, owner, data, parent_ids, ancestor_ids, when_deleted, when_last_modified
    from public.odm_items
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
  const embedding = body.embeddingText ? await createEmbedding(body.embeddingText) : null;

  if (body.storeVersionHistory) {
    const historyId = `${item_id}_${crypto.randomUUID()}`;
    await sql`
      insert into public.odm_item_history
        (history_id, collection, item_id, owner, data, parent_ids, ancestor_ids)
      values (
        ${historyId}, ${collection}, ${item_id}, ${body.owner},
        ${sql.json(body.data as Parameters<typeof sql.json>[0])}, ${body.parentIds}, ${body.ancestorIds}
      )
    `;
  }

  if (embedding) {
    await sql`
      insert into public.odm_items
        (collection, id, owner, data, parent_ids, ancestor_ids, when_last_modified, when_deleted,
         embedding, embedding_text, embedding_model)
      values (
        ${collection}, ${item_id}, ${body.owner},
        ${sql.json(body.data as Parameters<typeof sql.json>[0])}, ${body.parentIds}, ${body.ancestorIds}, now(), null,
        ${toPgVector(embedding)}::vector, ${body.embeddingText!.trim()}, ${EMBEDDING_MODEL}
      )
      on conflict (collection, id) do update set
        owner = excluded.owner,
        data = excluded.data,
        parent_ids = excluded.parent_ids,
        ancestor_ids = excluded.ancestor_ids,
        when_last_modified = now(),
        when_deleted = null,
        embedding = excluded.embedding,
        embedding_text = excluded.embedding_text,
        embedding_model = excluded.embedding_model
    `;
  } else {
    await sql`
      insert into public.odm_items
        (collection, id, owner, data, parent_ids, ancestor_ids, when_last_modified, when_deleted)
      values (
        ${collection}, ${item_id}, ${body.owner},
        ${sql.json(body.data as Parameters<typeof sql.json>[0])}, ${body.parentIds}, ${body.ancestorIds}, now(), null
      )
      on conflict (collection, id) do update set
        owner = excluded.owner,
        data = excluded.data,
        parent_ids = excluded.parent_ids,
        ancestor_ids = excluded.ancestor_ids,
        when_last_modified = now(),
        when_deleted = null
    `;
  }

  return c.json({ ok: true });
});

odmRouter.post('/api/odm/search', async c => {
  const body = await c.req.json<OdmSearchRequest>();
  if (!body.owner || !body.query?.trim()) return c.json({ error: 'owner and query required' }, 400);

  const limit = Math.max(1, Math.min(Math.trunc(body.limit ?? 10), 100));
  const minSimilarity = Math.max(-1, Math.min(body.minSimilarity ?? 0, 1));
  await ensureTables();

  const sql = getSql();
  const queryVector = toPgVector(await createEmbedding(body.query));
  const rows = await sql`
    select collection, id as item_id, owner, data, parent_ids, ancestor_ids,
      embedding_text, embedding_model, when_last_modified,
      1 - (embedding <=> ${queryVector}::vector) as similarity
    from public.odm_items
    where owner = ${body.owner}
      and when_deleted is null
      and embedding is not null
      ${body.collection ? sql`and collection = ${body.collection}` : sql``}
      and 1 - (embedding <=> ${queryVector}::vector) >= ${minSimilarity}
    order by embedding <=> ${queryVector}::vector
    limit ${limit}
  `;

  return c.json({
    items: rows.map(row => ({
      ...row,
      similarity: Number(row['similarity']),
      when_last_modified: row['when_last_modified']?.toISOString() ?? null,
    })),
  });
});

odmRouter.post('/api/odm/items/:collection/:item_id/delete', async c => {
  const collection = c.req.param('collection');
  const item_id = c.req.param('item_id');
  const body = await c.req.json<OdmDeleteRequest>();

  await ensureTables();
  const sql = getSql();

  await sql`
    update public.odm_items
    set when_deleted = now(), when_last_modified = now()
    where collection = ${collection} and id = ${item_id} and owner = ${body.owner}
  `;

  return c.json({ ok: true });
});
