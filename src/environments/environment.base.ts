// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environmentBase = {

  collectionNameSuffix: '',
  // collectionNameSuffix: '_DEBUG',

  odmBackend: 'supabase', // 'firestore' reads, mirrored to Supabase+Neon via 'fanout'; or 'firestore'/'supabase'/'neon' alone
  authBackend: 'firebase',

  // OrYoL (/tree) is being migrated off its standalone Firestore-only data layer onto the
  // shared ODM/Supabase sync engine (offline cache, durable pending-edits journal, subtree
  // sharing). Stays 'firestore' until the one-time backfill + verification pass is done, so
  // there's a clean rollback path during the migration - see the OrYoL tree migration plan.
  oryolTreeBackend: 'firestore', // 'firestore' | 'supabase'

  supabase: {
    url: 'https://xjqivegtpzstkzabqncb.supabase.co',
    publishableKey: 'sb_publishable_suMlx8EqAnd4jZqdPPZBrw_lWZOPxi-',
    schema: 'public',
    odmItemsTable: 'odm_items',
    odmHistoryTable: 'odm_item_history',
  },

  neon: {
    enabled: false, // no server / NEON_DATABASE_URL configured yet; flip on once it is
    odmApiUrl: 'http://localhost:8000/api/odm',
    pollIntervalMs: 5000,
  },

  showExperimentalThemes: true,
  firebaseConfig: {
    projectId: 'cloudtime-app',
    apiKey: "AIzaSyD8hiBc7WoQQISCDpDLMtiaakyKvKZwdkw",
    authDomain: "cloudtime-app.firebaseapp.com",
    databaseURL: "https://cloudtime-app.firebaseio.com",
    storageBucket: "cloudtime-app.appspot.com",
    // messagingSenderId: "42917465053"
  },
  // production: true
  production: false,
  aiBackendUrl: 'http://localhost:8000',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
