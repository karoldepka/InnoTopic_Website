# LifeSuite ODM Postgres Backends

The app now has four ODM backend options:

- `firestore` keeps the existing AngularFire implementation.
- `supabase` uses `@supabase/supabase-js`, PostgREST, and Supabase Realtime against `public.odm_items`.
- `neon` uses the Angular `HttpClient` adapter against the `backend-ts` (Hono) server's `/api/odm` endpoints, keeping the Neon connection string on the server.
- `fanout` reads from Firestore (still primary) and mirrors every save/delete, plus every item read back from Firestore, into both Supabase and Neon. Use this during the migration to backfill Postgres passively — just by using the app — before cutting reads over to `supabase` or `neon`.

Set the active backend in `src/environments/environment.base.ts`:

```ts
odmBackend: 'firestore' // or 'supabase' or 'neon' or 'fanout'
```

For Supabase, fill in:

```ts
supabase: {
  url: 'https://your-project.supabase.co',
  publishableKey: 'sb_publishable_...',
  schema: 'public',
  odmItemsTable: 'odm_items',
  odmHistoryTable: 'odm_item_history',
}
```

Run `docs/odm-postgres-schema.sql` against your Supabase project before switching to `supabase` or `fanout`. Run `docs/odm-postgres-schema-neon.sql` against your Neon project the same way before enabling `neon`. Both files create the same core tables (`odm_items` with primary key `id`, `odm_item_history` with `item_id`) - the Supabase file additionally enables RLS, grants, policies, and the realtime publication, which Neon doesn't need since it's only ever reached through `backend-ts`, not directly from the browser.

## Auth Notes

The app currently gets `owner` from Firebase Auth. The Supabase direct adapter bridges the existing Firebase session in via `SupabaseOdmClientService`'s `accessToken` callback (Supabase "Third-Party Auth" for Firebase must be registered in the Supabase dashboard, with the role claim key set to the literal `"authenticated"`). Because Firebase UIDs aren't valid Postgres `uuid`s, the RLS policies compare `owner` against `auth.jwt() ->> 'sub'` (the raw JWT claim) rather than `auth.uid()` (which is typed `uuid` and only resolves Supabase's own UUID-format user ids).

If you want to keep Firebase Auth, the Neon HTTP adapter is the safer shape: verify Firebase ID tokens in the `backend-ts` layer, then access Postgres with `ODM_DATABASE_URL` (or `DATABASE_URL`) from server env vars. The current endpoint contract accepts `owner` from the client to match the existing app flow, so token verification should be added before production use.

## Neon API Env

The Neon-backed ODM API lives in `backend-ts/src/routes/odm.ts`, served by the same Hono app as the other AI endpoints (`backend-ts/src/index.ts`).

Backend (`backend-ts/.env`):

```bash
ODM_DATABASE_URL=postgresql://...
# or DATABASE_URL=postgresql://...
ODM_ENSURE_TABLES=1   # optional, local/dev bootstrapping only - creates tables on first request
```

Frontend:

```ts
neon: {
  enabled: false, // flip on once ODM_DATABASE_URL is set and backend-ts is running
  odmApiUrl: 'http://localhost:8000/api/odm',
  pollIntervalMs: 5000,
}
```

Prefer running `docs/odm-postgres-schema.sql`-equivalent DDL by hand in controlled/production environments rather than relying on `ODM_ENSURE_TABLES`.
