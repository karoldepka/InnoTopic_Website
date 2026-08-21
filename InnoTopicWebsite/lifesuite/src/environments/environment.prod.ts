import {environmentBase} from './environment.base'

export const environment = {
  ... environmentBase,
  collectionNameSuffix: '' /* NOTE: never put debug suffix here, coz wanna deploy to vercel to use it */,
  production: true,
  aiBackendUrl: 'https://life-suite-backend.vercel.app',
  // environmentBase's neon/mongo odmApiUrl default to localhost:8000 (dev-only) - backend-ts is
  // now deployed at life-suite-backend.vercel.app (see lifesuite/backend-ts), so the fanout ODM
  // backend can actually reach Neon/Mongo from a real browser instead of only in local dev.
  neon: {
    ...environmentBase.neon,
    odmApiUrl: 'https://life-suite-backend.vercel.app/api/odm',
  },
  mongo: {
    ...environmentBase.mongo,
    odmApiUrl: 'https://life-suite-backend.vercel.app/api/odm-mongo',
  },
  // SurrealDB only exists as a local Docker container so far (see backend-ts/.env) - there's no
  // hosted instance a real deployed build could reach yet. Since FanoutOdmCollectionBackend's
  // saveNowToDb() blocks on every enabled peer confirming, leaving this enabled here would break
  // every save for real users the moment this build actually deployed. Flip to true (and add a
  // real odmApiUrl override above, matching neon/mongo) once a real SurrealDB instance exists.
  surreal: {
    ...environmentBase.surreal,
    enabled: false,
  },
};
