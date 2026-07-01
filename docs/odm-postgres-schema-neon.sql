-- Neon migration for the ODM tables. Same core shape as docs/odm-postgres-schema.sql
-- (Supabase), minus the RLS policies/grants/realtime publication - Neon is only reached
-- through backend-ts, which enforces `owner` filtering server-side instead of via RLS.

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
);

create index if not exists odm_items_owner_collection_modified_idx
  on public.odm_items (owner, collection, when_last_modified desc);

create index if not exists odm_items_parent_ids_idx
  on public.odm_items using gin (parent_ids);

create index if not exists odm_items_ancestor_ids_idx
  on public.odm_items using gin (ancestor_ids);

create table if not exists public.odm_item_history (
  history_id text primary key,
  collection text not null,
  item_id text not null,
  owner text not null,
  data jsonb not null default '{}'::jsonb,
  parent_ids text[] not null default '{}',
  ancestor_ids text[] not null default '{}',
  snapshot_at timestamptz not null default now()
);

create index if not exists odm_item_history_item_idx
  on public.odm_item_history (owner, collection, item_id, snapshot_at desc);
