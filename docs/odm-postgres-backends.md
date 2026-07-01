# LifeSuite ODM Postgres Backends

The app now has four ODM backend options:

- `firestore` keeps the existing AngularFire implementation.
- `supabase` uses `@supabase/supabase-js`, PostgREST, and Supabase Realtime against `public.lifesuite_odm_items`.
- `neon` uses the Angular `HttpClient` adapter against the FastAPI endpoints under `/api/odm`, keeping the Neon connection string on the server.
- `fanout` reads from Firestore (still primary) and mirrors every save/delete, plus every item read back from Firestore, into both Supabase and Neon. Use this during the migration to backfill Postgres passively — just by using the app — before cutting reads over to `supabase` or `neon`.

Set the active backend in `src/environments/environment.base.ts`:

```ts
odmBackend: 'firestore' // or 'supabase' or 'neon'
```

For Supabase, fill in:

```ts
supabase: {
  url: 'https://your-project.supabase.co',
  publishableKey: 'sb_publishable_...',
  schema: 'public',
  odmItemsTable: 'lifesuite_odm_items',
  odmHistoryTable: 'lifesuite_odm_item_history',
}
```

Run `docs/odm-postgres-schema.sql` in Supabase or Neon before switching backends.

## Auth Notes

The app currently gets `owner` from Firebase Auth. The Supabase direct adapter is best paired with Supabase Auth or a server-issued Supabase-compatible JWT, because the included RLS policies compare `owner` to `auth.uid()`.

If you want to keep Firebase Auth, the Neon HTTP adapter is the safer shape: verify Firebase ID tokens in the FastAPI layer, then access Postgres with `NEON_DATABASE_URL` or `DATABASE_URL` from server env vars. The current endpoint contract accepts `owner` from the client to match the existing app flow, so token verification should be added before production use.

## Neon API Env

Backend:

```bash
NEON_DATABASE_URL=postgresql://...
# or DATABASE_URL=postgresql://...
```

Frontend:

```ts
neon: {
  odmApiUrl: 'http://localhost:8000/api/odm',
  pollIntervalMs: 5000,
}
```

Set `LIFESUITE_ODM_AUTO_MIGRATE=true` only for local/dev bootstrapping. Prefer the SQL file for controlled environments.
