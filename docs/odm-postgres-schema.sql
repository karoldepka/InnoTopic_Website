create extension if not exists vector with schema extensions;

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

alter table public.odm_items
  add column if not exists embedding extensions.vector(768),
  add column if not exists embedding_text text,
  add column if not exists embedding_model text;

create index if not exists odm_items_embedding_hnsw_idx
  on public.odm_items using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null and when_deleted is null;

-- Semantic duplicate lookup for generated Learn Q&A. SECURITY INVOKER keeps normal RLS in
-- force; the explicit Firebase-sub predicate is defense in depth and helps the vector planner
-- filter before ranking. No caller-supplied owner is accepted.
create or replace function public.match_learn_item_questions(
  query_embedding extensions.vector(768),
  match_threshold double precision default 0.92,
  match_count integer default 3
)
returns table (
  item_id text,
  question text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    item.id,
    item.embedding_text,
    1 - (item.embedding <=> query_embedding) as similarity
  from public.odm_items as item
  where item.collection = 'LearnItem'
    and item.owner = (select auth.jwt() ->> 'sub')
    and item.when_deleted is null
    and item.embedding is not null
    and 1 - (item.embedding <=> query_embedding) >= match_threshold
  order by item.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

revoke all on function public.match_learn_item_questions(extensions.vector, double precision, integer) from public, anon;
grant execute on function public.match_learn_item_questions(extensions.vector, double precision, integer) to authenticated;

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

-- OrYoL subtree sharing: lets an OryItem's owner grant read/write access to that item and
-- all its descendants (via ancestor_ids) to another user. Group grants are schema-reserved
-- (granted_to_group_id) but not yet queried by any RLS policy - adding group support later
-- is additive, not a schema change.
create table if not exists public.ory_subtree_shares (
  id uuid primary key default gen_random_uuid(),
  subtree_root_item_id text not null,
  granted_to_uid text,
  granted_to_group_id text,
  granted_by_uid text not null,
  permission text not null default 'write' check (permission in ('read', 'write')),
  created_at timestamptz not null default now(),
  check (granted_to_uid is not null or granted_to_group_id is not null)
);

create index if not exists ory_subtree_shares_granted_to_uid_idx
  on public.ory_subtree_shares (granted_to_uid);

create index if not exists ory_subtree_shares_subtree_root_idx
  on public.ory_subtree_shares (subtree_root_item_id);

alter table public.ory_subtree_shares enable row level security;

grant select, insert, delete on public.ory_subtree_shares to authenticated, anon;

drop policy if exists "Users can read shares involving them" on public.ory_subtree_shares;
create policy "Users can read shares involving them"
  on public.ory_subtree_shares
  for select
  to authenticated, anon
  using (
    granted_to_uid = (select auth.jwt() ->> 'sub')
    or granted_by_uid = (select auth.jwt() ->> 'sub')
  );

-- Only the subtree's actual owner can grant/revoke access to it (not a re-share by someone
-- who merely has write access) - simplest safe default for this pass.
--
-- This check can't be a direct `exists (select 1 from odm_items ...)` subquery: odm_items'
-- own SELECT/INSERT/UPDATE/DELETE policies below query ory_subtree_shares right back (for the
-- sharing carve-out), so a direct subquery here creates a circular RLS dependency between the
-- two tables - confirmed live (Postgres error 42P17, "infinite recursion detected in policy for
-- relation ory_subtree_shares") when this was first tried as a plain subquery. A SECURITY
-- DEFINER function breaks the cycle: its internal query runs with the function owner's
-- privileges, bypassing RLS re-evaluation on odm_items instead of re-triggering its policies.
create or replace function public.user_owns_ory_item(item_id text, uid text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from odm_items i
    where i.collection = 'OryItem' and i.id = item_id and i.owner = uid
  );
$$;

drop policy if exists "Users can grant access to subtrees they own" on public.ory_subtree_shares;
create policy "Users can grant access to subtrees they own"
  on public.ory_subtree_shares
  for insert
  to authenticated, anon
  with check (
    granted_by_uid = (select auth.jwt() ->> 'sub')
    and public.user_owns_ory_item(subtree_root_item_id, (select auth.jwt() ->> 'sub'))
  );

drop policy if exists "Users can revoke shares they granted" on public.ory_subtree_shares;
create policy "Users can revoke shares they granted"
  on public.ory_subtree_shares
  for delete
  to authenticated, anon
  using (granted_by_uid = (select auth.jwt() ->> 'sub'));

-- Extend odm_items RLS: access via ownership (unchanged) OR a matching subtree share, scoped
-- to OryItem/OryNodeInclusion rows only so this can't widen access on unrelated collections.
drop policy if exists "Users can read their ODM items" on public.odm_items;
create policy "Users can read their ODM items"
  on public.odm_items
  for select
  to authenticated, anon
  using (
    owner = (select auth.jwt() ->> 'sub')
    or (
      collection in ('OryItem', 'OryNodeInclusion')
      and exists (
        select 1 from public.ory_subtree_shares s
        where s.granted_to_uid = (select auth.jwt() ->> 'sub')
          and (s.subtree_root_item_id = odm_items.id
               or s.subtree_root_item_id = any (odm_items.ancestor_ids))
      )
    )
  );

drop policy if exists "Users can insert their ODM items" on public.odm_items;
create policy "Users can insert their ODM items"
  on public.odm_items
  for insert
  to authenticated, anon
  with check (
    owner = (select auth.jwt() ->> 'sub')
    or (
      collection in ('OryItem', 'OryNodeInclusion')
      and exists (
        select 1 from public.ory_subtree_shares s
        where s.granted_to_uid = (select auth.jwt() ->> 'sub')
          and s.permission = 'write'
          and (s.subtree_root_item_id = odm_items.id
               or s.subtree_root_item_id = any (odm_items.ancestor_ids))
      )
    )
  );

drop policy if exists "Users can update their ODM items" on public.odm_items;
create policy "Users can update their ODM items"
  on public.odm_items
  for update
  to authenticated, anon
  using (
    owner = (select auth.jwt() ->> 'sub')
    or (
      collection in ('OryItem', 'OryNodeInclusion')
      and exists (
        select 1 from public.ory_subtree_shares s
        where s.granted_to_uid = (select auth.jwt() ->> 'sub')
          and s.permission = 'write'
          and (s.subtree_root_item_id = odm_items.id
               or s.subtree_root_item_id = any (odm_items.ancestor_ids))
      )
    )
  )
  with check (
    owner = (select auth.jwt() ->> 'sub')
    or (
      collection in ('OryItem', 'OryNodeInclusion')
      and exists (
        select 1 from public.ory_subtree_shares s
        where s.granted_to_uid = (select auth.jwt() ->> 'sub')
          and s.permission = 'write'
          and (s.subtree_root_item_id = odm_items.id
               or s.subtree_root_item_id = any (odm_items.ancestor_ids))
      )
    )
  );

drop policy if exists "Users can delete their ODM items" on public.odm_items;
create policy "Users can delete their ODM items"
  on public.odm_items
  for delete
  to authenticated, anon
  using (
    owner = (select auth.jwt() ->> 'sub')
    or (
      collection in ('OryItem', 'OryNodeInclusion')
      and exists (
        select 1 from public.ory_subtree_shares s
        where s.granted_to_uid = (select auth.jwt() ->> 'sub')
          and s.permission = 'write'
          and (s.subtree_root_item_id = odm_items.id
               or s.subtree_root_item_id = any (odm_items.ancestor_ids))
      )
    )
  );

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
