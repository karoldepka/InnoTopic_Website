import {environmentBase} from './environment.base'

export const environment = {
  ... environmentBase,
  collectionNameSuffix: '' /* NOTE: never put debug suffix here, coz wanna deploy to vercel to use it */,
  production: true,
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
};
