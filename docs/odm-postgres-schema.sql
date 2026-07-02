create table if not exists public.odm_items (
  collection text not null,
  id text not null,
  owner text not null,
  data jsonb not null default '{}'::jsonb,
  parent_ids text[] not null default '{}',
  ancestor_ids text[] not null default '{}',
  when_last_modified timestamptz not null default now(),
  when_deleted timestamptz,
  -- Client-supplied when_last_modified isn't safe as a sync watermark (cross-device clock
  -- skew - see docs/odm-incremental-sync-plan.md). This column is set by Postgres only
  -- (default now() on insert, trigger below forces it on every update regardless of what a
  -- client sends), making it the single authoritative clock for incremental-sync cursors.
  server_modified_at timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists odm_items_owner_collection_modified_idx
  on public.odm_items (owner, collection, when_last_modified desc);

create index if not exists odm_items_owner_collection_server_modified_idx
  on public.odm_items (owner, collection, server_modified_at desc);

create index if not exists odm_items_parent_ids_idx
  on public.odm_items using gin (parent_ids);

create index if not exists odm_items_ancestor_ids_idx
  on public.odm_items using gin (ancestor_ids);

create or replace function public.odm_items_set_server_modified_at()
returns trigger as $$
begin
  new.server_modified_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists odm_items_server_modified_at on public.odm_items;
create trigger odm_items_server_modified_at
  before update on public.odm_items
  for each row execute function public.odm_items_set_server_modified_at();

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

alter table public.odm_items enable row level security;
alter table public.odm_item_history enable row level security;

grant select, insert, update, delete on public.odm_items to authenticated;
grant select, insert on public.odm_item_history to authenticated;

-- Firebase-issued JWTs bridged into Supabase don't carry a `role: authenticated` claim
-- (that requires a Firebase Auth Blocking Function we haven't deployed), so PostgREST
-- resolves the Postgres role to `anon` for these requests even though the JWT itself is
-- valid and its `sub` is the real Firebase uid. Policies also permit `anon` here so those
-- requests aren't rejected before the owner check even runs - a truly anonymous request
-- has no `sub` claim, so it can never match an owner and stays denied.

drop policy if exists "Users can read their ODM items" on public.odm_items;
create policy "Users can read their ODM items"
  on public.odm_items
  for select
  to authenticated, anon
  using (owner = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can insert their ODM items" on public.odm_items;
create policy "Users can insert their ODM items"
  on public.odm_items
  for insert
  to authenticated, anon
  with check (owner = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can update their ODM items" on public.odm_items;
create policy "Users can update their ODM items"
  on public.odm_items
  for update
  to authenticated, anon
  using (owner = (select auth.jwt() ->> 'sub'))
  with check (owner = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can delete their ODM items" on public.odm_items;
create policy "Users can delete their ODM items"
  on public.odm_items
  for delete
  to authenticated, anon
  using (owner = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can read their ODM history" on public.odm_item_history;
create policy "Users can read their ODM history"
  on public.odm_item_history
  for select
  to authenticated, anon
  using (owner = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can insert their ODM history" on public.odm_item_history;
create policy "Users can insert their ODM history"
  on public.odm_item_history
  for insert
  to authenticated, anon
  with check (owner = (select auth.jwt() ->> 'sub'));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.odm_items;
  end if;
exception
  when duplicate_object then null;
end $$;
