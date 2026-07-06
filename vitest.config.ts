import {defineConfig} from 'vitest/config'

// Scoped deliberately to just the ODM/IndexedDB tests below, rather than every *.spec.ts in
// src/ - unlike the Angular Karma test target, this must never accidentally pull in the
// repo's large pool of pre-existing, unrelated broken legacy specs.
export default defineConfig({
  test: {
    setupFiles: ['./vitest-setup.ts'],
    include: [
      'src/app/libs/AppFedShared/utils/promiseUtils.spec.ts',
      'src/app/libs/AppFedShared/odm/utils.spec.ts',
      'src/app/libs/AppFedSharedBrowser/odm-browser/**/*.spec.ts',
      'src/app/libs/AppFedSharedFanout/odm-fanout/**/*.spec.ts',
      'src/app/apps/OrYoL/db-supabase/**/*.spec.ts',
      'src/app/apps/Learn/search-or-add-learnable-item/mic/mic.component.spec.ts',
      'src/app/apps/Learn/core/quiz/quiz-hint-reveal.spec.ts',
      'src/app/apps/Learn/search-or-add-learnable-item/list-processing.spec.ts',
      'src/app/libs/AppFedSharedIonic/ratings/star-rating/**/*.spec.ts',
      // NOT a glob here deliberately: src/app/libs/AppFedShared/tree/ also has pre-existing
      // Jasmine-style specs (GenericItem$.spec.ts, min-mid-max-cell.component.spec.ts) that are
      // part of the broken legacy Karma suite - a glob would sweep those in too.
      'src/app/libs/AppFedShared/tree/generic-items.service.spec.ts',
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
