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
);

create index if not exists lifesuite_odm_items_owner_collection_modified_idx
  on public.lifesuite_odm_items (owner, collection, when_last_modified desc);

create index if not exists lifesuite_odm_items_parent_ids_idx
  on public.lifesuite_odm_items using gin (parent_ids);

create index if not exists lifesuite_odm_items_ancestor_ids_idx
  on public.lifesuite_odm_items using gin (ancestor_ids);

create table if not exists public.lifesuite_odm_item_history (
  history_id text primary key,
  collection text not null,
  item_id text not null,
  owner text not null,
  data jsonb not null default '{}'::jsonb,
  parent_ids text[] not null default '{}',
  ancestor_ids text[] not null default '{}',
  snapshot_at timestamptz not null default now()
);

create index if not exists lifesuite_odm_item_history_item_idx
  on public.lifesuite_odm_item_history (owner, collection, item_id, snapshot_at desc);

alter table public.lifesuite_odm_items enable row level security;
alter table public.lifesuite_odm_item_history enable row level security;

grant select, insert, update, delete on public.lifesuite_odm_items to authenticated;
grant select, insert on public.lifesuite_odm_item_history to authenticated;

drop policy if exists "Users can read their ODM items" on public.lifesuite_odm_items;
create policy "Users can read their ODM items"
  on public.lifesuite_odm_items
  for select
  to authenticated
  using (owner = (select auth.uid())::text);

drop policy if exists "Users can insert their ODM items" on public.lifesuite_odm_items;
create policy "Users can insert their ODM items"
  on public.lifesuite_odm_items
  for insert
  to authenticated
  with check (owner = (select auth.uid())::text);

drop policy if exists "Users can update their ODM items" on public.lifesuite_odm_items;
create policy "Users can update their ODM items"
  on public.lifesuite_odm_items
  for update
  to authenticated
  using (owner = (select auth.uid())::text)
  with check (owner = (select auth.uid())::text);

drop policy if exists "Users can delete their ODM items" on public.lifesuite_odm_items;
create policy "Users can delete their ODM items"
  on public.lifesuite_odm_items
  for delete
  to authenticated
  using (owner = (select auth.uid())::text);

drop policy if exists "Users can read their ODM history" on public.lifesuite_odm_item_history;
create policy "Users can read their ODM history"
  on public.lifesuite_odm_item_history
  for select
  to authenticated
  using (owner = (select auth.uid())::text);

drop policy if exists "Users can insert their ODM history" on public.lifesuite_odm_item_history;
create policy "Users can insert their ODM history"
  on public.lifesuite_odm_item_history
  for insert
  to authenticated
  with check (owner = (select auth.uid())::text);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.lifesuite_odm_items;
  end if;
exception
  when duplicate_object then null;
end $$;
