import {defineConfig} from 'vitest/config'

// Scoped deliberately to just the ODM/IndexedDB tests below, rather than every *.spec.ts in
// src/ - unlike the Angular Karma test target, this must never accidentally pull in the
// repo's large pool of pre-existing, unrelated broken legacy specs.
export default defineConfig({
  test: {
    include: [
      'src/app/libs/AppFedShared/utils/promiseUtils.spec.ts',
      'src/app/libs/AppFedSharedBrowser/odm-browser/**/*.spec.ts',
      'src/app/libs/AppFedSharedFanout/odm-fanout/**/*.spec.ts',
    ],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        {browser: 'chromium'},
      ],
    },
  },
})
