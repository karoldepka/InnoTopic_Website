# Incremental sync from Supabase, backed by the local cache

## Context

Today `SupabaseOdmCollectionBackend` re-fetches the *entire* collection on
every load (no filtering by modification time at all), and the local
IndexedDB cache built earlier today (`BrowserOdmStorage`/
`BrowserOdmCollectionBackend`/`CachingOdmCollectionBackend`) is currently
write-only - nothing ever reads from it. The goal now: stop re-fetching rows
that haven't changed since the last sync, using a persisted per-collection
watermark, and make the local cache the actual seed for the item list so
that skipping unchanged rows doesn't mean losing them from view.

Also explicit: **the app must work completely offline**, including on a
launch where the local cache hasn't synced with the server even once yet -
not just "tolerate losing connection after being online." Concretely this
means `CachingOdmCollectionBackend` cannot let a Supabase failure surface as
a blocking error; a degraded/unreachable primary must be silent (design
section 6 below) and the cache must remain fully usable for read and write
on its own. (Out of scope here: a user who has *never once* authenticated
while offline still can't get an owner id, since everything is scoped by
Firebase-uid ownership today - that's the guest/anonymous-identity design
already discussed and deferred earlier this session, a distinct feature.)

Correctness requirements the user called out explicitly, all real:
1. **Clock skew** - and specifically *cross-device* clock skew, not just
   client-vs-server. `when_last_modified` is not server-authoritative today:
   it's set client-side by `OdmBackend.nowTimestamp()` (`OdmBackend.ts:33-35`,
   Firestore `Timestamp.now()`) using whichever device saved the row, and
   sent to Postgres as plain data. If Device A's clock runs fast, a row it
   writes could carry a `when_last_modified` minutes into the future; if the
   sync cursor is set from that value, `.gte(cursor)` on the next fetch would
   then silently skip any row a *different*, correctly-clocked Device B wrote
   in between - forever, since the cursor never moves backward. Deriving the
   cursor from "whatever Postgres returned" isn't enough on its own if the
   column itself is client-supplied. The fix: introduce a second column,
   `server_modified_at`, set by Postgres itself (`default now()` on insert,
   a `BEFORE UPDATE` trigger on update) that no client ever writes to - this
   becomes the sync-cursor watermark, completely decoupled from the
   client-supplied `when_last_modified` used for edit-conflict comparison
   below. The client never compares the cursor to its own clock at all; it
   just stores whatever `server_modified_at` came back and echoes it in the
   next query's `.gte()` filter - one single authoritative clock (Postgres's),
   zero dependence on any client's clock being correct.

   Even Postgres's own clock isn't perfectly safe for a *strict* watermark,
   though: `now()` reflects transaction *start*, not commit, so under
   concurrent writes, commit order isn't guaranteed to match
   `server_modified_at` order - a row could commit (become visible) after a
   later-timestamped row already advanced the cursor past it, and a strict
   `.gte(cursor)` would then miss it permanently. Mitigation: query with a
   trailing buffer, `.gte(cursor - 10 minutes)` rather than `.gte(cursor)`
   (design section 3 below) - refetches a small, harmless overlap of
   already-seen rows (idempotent no-ops against the cache) in exchange for
   never missing one to this ordering race.
2. **Don't clobber unsynced local edits** - investigated this and confirmed
   a real, pre-existing gap: `OdmItem$2.applyDataFromDbAndEmit` (line 318-325)
   unconditionally overwrites `currentVal` with whatever data arrives from
   the backend, with zero timestamp comparison and zero check for a pending
   local edit. The method already carries the original developer's own FIXME
   flagging exactly this ("this should be really where
   canApplyDataToViewGivenColumnLocalEdits() protection stuff is done!!").
   `OdmService2.createBackendListener()`'s `onModified` handler (line ~293)
   calls it with no guard at all; `onAdded` (line ~272) only guards on
   "have I already emitted something for this id," not on recency - so once
   the cache-then-delta merge below is wired up, a delayed/stale server read
   could otherwise overwrite a fresher locally-cached edit. This plan fixes
   that at the source (the apply path) rather than working around it per
   call site, since it protects every caller of `applyDataFromDbAndEmit`,
   not just the new sync flow.
3. **Offline edits** - splits into two genuinely different cases:
   - *Same-device race* (a server echo/refresh arrives while this device
     still has its own edit in flight, e.g. right after reconnecting from
     offline): solvable with **zero** clock dependency. `OdmItem$2` already
     tracks `hasPendingPatch` (set true on local edit, cleared only after
     `onDbWriteResolved` - see `OdmItem$2.ts` patch-tracking flow), so
     `applyDataFromDbAndEmit` can simply defer applying incoming data while
     `hasPendingPatch` is true, no timestamp comparison needed.
   - *Cross-device conflict* (two different devices both eventually sync
     edits to the same item, one of which may have been offline for a
     while): there is no clock-skew-proof way to determine true edit order
     here. Sync-arrival order (`server_modified_at`) unfairly penalizes an
     edit that was made offline for a long time, purely because it took
     longer to reach the server; client edit-time order (`when_last_modified`)
     is more intent-correct but inherits whatever skew exists between the
     two devices' clocks - a fundamental distributed-systems limit (why
     CRDTs/vector clocks exist), out of scope to fully solve here. Mitigation:
     `when_last_modified` client-time ordering decides the automatic winner,
     but the conflict-archival + toast mechanism (design section 4-5 below)
     guarantees a wrong automatic pick is never silently lossy - the losing
     edit is always preserved and surfaced for a human to notice.

`OdmBackend.nowTimestamp()` always returns a Firestore `Timestamp`
(`OdmBackend.ts:33-35`) regardless of which backend is active today, and
`whenLastModified` is always populated via `setWhenLastModified()`
(`OdmItem$2.ts:312-316`) on every local patch - so a timestamp comparison
guard is reliably meaningful across Firestore/Supabase/Neon-sourced data
alike, using the existing `timestampLikeToIsoString`/`reviveFirestoreTimestamps`
conversions already in `AppFedSharedPostgres/odm-postgres/PostgresOdmRow.ts`
for the Postgres-sourced side.

## Design

### 0. Postgres-authoritative `server_modified_at` column (via Supabase MCP `apply_migration`)
Add to `odm_items` (mirror into `docs/odm-postgres-schema.sql` for parity
with today's earlier migrations):
```sql
alter table public.odm_items
  add column if not exists server_modified_at timestamptz not null default now();

create index if not exists odm_items_owner_collection_server_modified_idx
  on public.odm_items (owner, collection, server_modified_at desc);

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
```
No client code ever writes this column - `default now()` covers insert, the
trigger forcibly overwrites whatever (if anything) a client sends on update.
This is the only place clock authority lives for sync purposes.

### 1. Guarded apply: unconfirmed-patch check first, then timestamp (fixes the real vulnerability)
`hasPendingPatch` is **not** the right signal here - it's set back to `false`
the instant the throttled save is *initiated* (`OdmItem$2.ts:177`, inside the
`localUserSavesToThrottle$` subscription, which fires synchronously when
`saveNowToDb` is called - not when the write resolves). So for the entire
in-flight network round-trip, `hasPendingPatch` already incorrectly reads
`false` - precisely the window a race is most likely. The field that
actually spans the whole unconfirmed window is `pendingDbPatch`
(`OdmItem$2.ts:119`): it's only pruned per-field in `onDbWriteResolved` once
a write is *confirmed*. Add a getter:
```ts
get hasUnsyncedChanges(): boolean {
  return Object.keys(this.pendingDbPatch).length > 0
}
```
In `OdmItem$2.applyDataFromDbAndEmit` (`OdmItem$2.ts:318`), before calling
`emitNewVal`, add two checks in order:
1. If `this.hasUnsyncedChanges` is true, skip entirely (still-unconfirmed
   local edit, initiated or in flight - clock-independent, see Context #3).
2. Otherwise, compare timestamps. Add a small generic helper (Firestore
   `Timestamp` has `.toMillis()`; also handle `Date`/ISO string) alongside
   `getNowTimePointSuitableForId` in `src/app/libs/AppFedShared/odm/utils.ts`:
   ```ts
   export function odmTimestampToMillis(value: any): number | undefined
   ```
   Compare `odmTimestampToMillis(incomingConverted.whenLastModified)` against
   `odmTimestampToMillis(this.currentVal?.whenLastModified)`. Apply if the
   incoming value is newer-or-equal, or if there's no existing value yet.

If either check skips the apply, log via `debugLog` (not `errorAlert` - this
is expected/routine, not an error) so it's visible while iterating.

Then simplify `OdmService2.createBackendListener()`'s `onAdded` handler
(`OdmService2.ts:~272`): remove the `!existingItem?.val$?.hasEmitted` guard
that currently no-ops for any already-known id (this is the behavior the
original author's own comment doubted - "isn't this gonna cause it to never
emit changes coming from another machine?"). Once `applyDataFromDbAndEmit`
itself guards on recency, `onAdded` can safely call it unconditionally, same
as `onModified` already does - this is what makes the cache-then-delta merge
below actually update items, not just insert new ones.

### 1b. Durable pending-edit journal (survives reload/crash, not just this tab session)
Both `hasPendingPatch` and `pendingDbPatch` are in-memory only on the
`OdmItem$2` instance - if the tab closes or crashes before a write confirms,
that state (and the guard above) is gone on next load, and the edit itself
is only as safe as whatever already reached `BrowserOdmStorage`'s mirror
(fire-and-forget, not guaranteed to have landed yet either). Add a third
`BrowserOdmStorage` object store, `pending_edits` (keyPath `` `${collection}::${item_id}` ``,
bumping `DB_VERSION` again), storing `{collection, item_id, patch, whenLastModified}`.
`patch` uses Firestore dot-notation for nested fields (e.g. `"answer.text"`
as the key), matching Firestore's own `.update()` convention - keys are
stored/typed as `Record<string, any>`, not forced through a flatten/diff
step at call sites (out of scope here; today's callers mostly pass whole
nested-object replacements, so this is a storage-format/typing choice now,
with finer-grained dot-path patch production as a natural follow-up):
- `savePendingEdit(collection, itemId, patch, whenLastModified)`: upsert,
  called from `OdmItem$2.patchThrottled`/`patchNow` (`OdmItem$2.ts:231`)
  right alongside the existing `Object.assign(this.pendingDbPatch, patch)`.
- `clearPendingEdit(collection, itemId)`: called from `onDbWriteResolved`
  once a write is confirmed and `pendingDbPatch` is fully pruned (empty).
- `getPendingEdit(collection, itemId): Promise<{patch, whenLastModified} | undefined>`
  and `getAllPendingEdits(collection)`, used on item hydration
  (`obtainItem$ById`/`createOdmItem$ForExisting`) to restore
  `pendingDbPatch`/`hasUnsyncedChanges` state after a reload, and to
  re-trigger `saveNowToDb` immediately for anything found - this is what
  makes an interrupted sync actually resume, not just stay safely inert.
  Directly narrows the "no retry-on-reconnect queue" limitation noted below.

This journal is also the recovery path referenced in the conflict-resolution
philosophy below: resolution is best-effort (automatic winner by
`when_last_modified`), and if that pick is ever wrong, the losing data isn't
gone - it's recoverable from here and/or the conflict-archive records
(design section 4).

### 2. Sync cursor storage (new IndexedDB object store)
Extend `BrowserOdmStorage` (`src/app/libs/AppFedSharedBrowser/odm-browser/BrowserOdmStorage.ts`)
rather than opening a second DB connection - bump `DB_VERSION` to 2, add a
`sync_cursors` object store (keyPath `collection`) in `onupgradeneeded`.
New methods:
```ts
getSyncCursor(collection: string): Promise<string | undefined>
updateSyncCursor(collection: string, observedWhenModified: string): Promise<void>
```
`updateSyncCursor` always max-merges against whatever's already stored
(`observed > existing ? observed : existing`). Both `get`/`updateSyncCursor`
only ever handle `server_modified_at` values echoed back from Postgres -
never anything client-generated - which is what actually makes this immune
to clock skew (cross-device or client-vs-server alike), per the Context
section above.

### 3. Cursor-filtered fetch in `SupabaseOdmCollectionBackend`
(`src/app/libs/AppFedSharedSupabase/odm-supabase/SupabaseOdmCollectionBackend.ts`)
- Inject `BrowserOdmStorage` via `this.injector.get(BrowserOdmStorage)` (same
  pattern already used for `SupabaseOdmClientService`).
- `PostgresOdmRow<TRaw>` (`AppFedSharedPostgres/odm-postgres/PostgresOdmRow.ts`)
  needs `server_modified_at?: string` added so it round-trips through
  `fetchRows`/`fromOdmItemsRow` - read-only from the client's perspective,
  never set by `createPostgresOdmRow`.
- In `fetchRows()` (line ~124), for the general/unscoped query only (no
  `parentId`/`ancestorId`): look up the cursor for `this.collectionName` and,
  if present, add `.gte('server_modified_at', cursor - SYNC_CURSOR_BUFFER_MS)`
  where `SYNC_CURSOR_BUFFER_MS = 10 * 60 * 1000` (10 min, named constant) -
  the buffer covers the transaction-commit-order race described in Context
  #1 above, not client clock skew (which `server_modified_at` already fully
  solves on its own).
- Do **not** apply the filter when `parentId`/`ancestorId` is set
  (`loadChildrenOf`/`loadTreeDescendantsOf` need completeness for their
  scoped query, not just recent changes) or in `subscribeToChanges`
  (Postgres realtime is already inherently incremental).
- After a successful unscoped fetch, compute the max `server_modified_at`
  across the returned rows and call `updateSyncCursor` with it.

### 4. Conflict resolution in `BrowserOdmStorage.put()`
Today's stale-write guard (`isStrictlyOlder`, added earlier for multi-tab
safety) silently discards an older incoming write and keeps the existing
newer row - fine for a benign duplicate/replay of data we already have, but
loses data if the older write is actually a *different*, divergent edit
(a genuine conflict: two edits diverged and we're about to discard one).
Distinguish the two: only treat it as a conflict if `row.data` is not
deep-equal to `existing.data` (`JSON.stringify` comparison is sufficient
here - both are plain JSON-shaped objects already).

On a genuine conflict:
- Keep `existing` (the newer one) at the original key, unchanged - it's the
  resolved winner.
- Persist the incoming (older, losing) row as a new row in the same store,
  id `` `${item_id}_conflict_${row.when_last_modified.replace(/[:.]/g, '-')}` ``
  (same sanitization `SupabaseOdmCollectionBackend.createHistoryId` already
  uses), `collection` unchanged - so it's a normal, browsable, full-fidelity
  row, just parked under a synthesized id. This `put()` bypasses the
  conflict check itself (new unique id, can't collide).
- Emit on a new `conflictDetected$ = new Subject<OdmConflict>()` field on
  `BrowserOdmStorage`: `{collection, winnerId: item_id, loserConflictId,
  winnerWhenModified, loserWhenModified}`.
- Still return the winner (as today), refreshing its `whenLastStoredLocally`.

### 5. Toast notification on conflict
New `OdmConflictToastService` (`providedIn: 'root'`, new file alongside
`BrowserOdmStorage.ts`) subscribes to `BrowserOdmStorage.conflictDetected$`
and shows an Ionic toast via `ToastController` (same pattern as
`presentDuplicateToast` in `search-or-add-learnable-item.page.ts:455-474`:
`toastController.create({message, buttons: [{text: 'Open', handler: () =>
router.navigateByUrl(...)}]})`). Navigation target: since URL-building is
per-collection today (only `LearnItem$.getRouterLinkUrl()` exists,
`'/learn/item/' + id`; Journal has no equivalent yet), keep a small
`collection -> (id) => url` lookup map in this new service rather than
inventing a generic cross-collection routing contract - `{LearnItem: id =>
\`/learn/item/${id}\`}` to start; falls back to an informational toast with
no "Open" button for unregistered collections (Journal, until it has a
details route). Instantiate this service once at app startup (e.g. alongside
other root singletons in `core.module.ts` or `app.component.ts` - find the
existing "eagerly instantiate a root service" pattern, if any, otherwise
inject it in `AppComponent`'s constructor to force instantiation).

### 6. `CachingOdmCollectionBackend` becomes the list source, not just a mirror
(`src/app/libs/AppFedSharedFanout/odm-fanout/CachingOdmCollectionBackend.ts`)
In `setListener` (line ~43): first call `this.cache.setListener(listener, {...queryOpts, limit: undefined, oneTimeGet: true}, () => {...})`
to replay everything already known locally (ignore `queryOpts.limit` here -
that cap exists to bound expensive remote reads, not cheap local ones), then
call `this.primary.setListener(this.wrapListenerWithMirroring(listener), queryOpts, callback)`
for the live/incremental layer on top, inside the cache callback so the cache
replay always lands first. Existing mirroring (write-through and
onAdded/onModified/onRemoved replication) stays as-is.

Also: the constructor currently only passes `silentErrors: true` to the
*cache* backend (`cacheOpts`), leaving `this.primary` (Supabase) to throw a
blocking `window.alert()` on any failure, network-unreachable included. Now
that the cache is the real read/write source, a primary failure means
"sync degraded, will catch up later," not "app is broken" - pass
`{...opts, silentErrors: true}` to `primary`'s `createCollectionBackend` too,
so it only logs. User-facing offline awareness stays where it already lives:
the browser `online`/`offline` event toasts in
`search-or-add-learnable-item.page.ts` (`onOnline`/`onOffline`), not
per-call error alerts. This is what actually makes "works completely
offline" (Context, above) true rather than aspirational.

## Explicitly out of scope for this pass
- `loadChildrenOf`/`loadTreeDescendantsOf` stay full-fetch (no cursor, no
  cache-seeding) - narrower, already-scoped queries where completeness
  matters more than the cost savings.
- No UI indicator for "showing cached data while syncing."
- No cursor invalidation/reset mechanism (e.g. if the local cache is ever
  cleared, the cursor should logically reset too, but wiring that isn't
  needed until cache-clearing itself is implemented).
- No automatic retry-on-reconnect queue for writes that failed while
  offline. `hasPendingPatch`/`pendingDbPatch` already correctly stay dirty
  when a write fails (`OdmService2.saveNowToDb`'s promise chain no-ops
  `onDbWriteResolved` on rejection), so no data or "needs sync" state is
  lost - but nothing currently re-triggers that save automatically when the
  device comes back online. Worth a follow-up, not required for this pass
  since the write remains safely queryable/re-editable locally in the
  meantime.
- Guest/anonymous identity for a user who has never authenticated at all
  while offline - separate, already-discussed feature (see Context).

## Verification
1. `npm run test:odm` after adding/extending specs:
   - `BrowserOdmStorage.spec.ts`:
     - `getSyncCursor`/`updateSyncCursor` round-trip, and max-merge never
       regresses (a lower observed value doesn't move the cursor backward).
     - Explicit "newer data arrives from server" cases (currently only
       implicitly covered): a `put()` with a strictly newer
       `when_last_modified` than what's cached overwrites `data` correctly,
       for both an already-cached row and a row cached from a prior
       `put()`/simulated fetch.
     - Conflict simulation: seed a row, then `put()` a different (divergent
       `data`), strictly-older row for the same id - assert the original
       (newer) row is unchanged at the original key, a new row exists at
       `<id>_conflict_<olderTimestamp>` with the older/losing data intact,
       and `conflictDetected$` emitted exactly once with the right ids.
     - Non-conflict case: an older `put()` with *identical* `data` to what's
       cached does NOT create a conflict record (benign duplicate/replay).
   - `promiseUtils.spec.ts` unaffected.
   - New spec for `odmTimestampToMillis` covering Firestore `Timestamp`,
     `Date`, ISO string, and undefined.
   - Extend `CachingOdmCollectionBackend.spec.ts`: `setListener` emits
     cached items before primary's items.
   - New spec covering `applyDataFromDbAndEmit`'s two guards directly:
     incoming data is skipped while `hasPendingPatch` is true regardless of
     timestamps; once clear, an older incoming timestamp is skipped and a
     newer one is applied.
2. Manually in the running app (`npm start`, `odmBackend: 'supabase'`):
   confirm the Network tab shows a `server_modified_at=gte.<cursor>` filter
   on the second load of a page within the same session, confirm Supabase
   logs / DevTools show fewer rows returned than the full collection count
   after the first sync, and manually trigger a conflict (edit the same item
   from two tabs/sessions) to confirm the toast appears and its "Open"
   button navigates to the winning item.
3. Confirm via Supabase MCP (`execute_sql`) that the `server_modified_at`
   trigger actually fires on update (value changes on every UPDATE
   regardless of what the client sends for it).
