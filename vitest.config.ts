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
      'src/app/libs/AppFedShared/odm/blob-sync.service.spec.ts',
      // Was never actually wired in before (orphaned, silently not running) - found while adding
      // reorder/indent tests here (GH #89 unify-the-tree-worlds effort).
      'src/app/libs/AppFedShared/odm/OdmItem$2.spec.ts',
      'src/app/apps/OrYoL/db-supabase/**/*.spec.ts',
      'src/app/apps/Learn/search-or-add-learnable-item/mic/mic.component.spec.ts',
      'src/app/apps/Learn/core/quiz/quiz-hint-reveal.spec.ts',
      'src/app/apps/Learn/quiz/quiz-item-details/quiz-answer-revealer/quiz-answer-revealer.component.spec.ts',
      'src/app/apps/Learn/what-next/what-next-destination-ranking.spec.ts',
      // Was never actually wired in before (orphaned, silently not running, same class of gap as
      // OdmItem$2.spec.ts above) - found while adding the onlyAiGenerated test (GH #100).
      'src/app/apps/Learn/core/quiz/quiz.service.spec.ts',
      'src/app/apps/Learn/search-or-add-learnable-item/list-processing.spec.ts',
      'src/app/libs/AppFedSharedIonic/ratings/star-rating/**/*.spec.ts',
      'src/app/libs/AppFedShared/time/time-point/time-point.component.spec.ts',
      'src/app/libs/AppFedShared/odm/ui/ViewSyncer.spec.ts',
      'src/app/libs/AppFedShared/utils/html-utils.spec.ts',
      // NOT a glob here deliberately: src/app/libs/AppFedShared/tree/ also has pre-existing
      // Jasmine-style specs (GenericItem$.spec.ts, min-mid-max-cell.component.spec.ts) that are
      // part of the broken legacy Karma suite - a glob would sweep those in too.
      'src/app/libs/AppFedShared/tree/generic-items.service.spec.ts',
      'src/app/libs/AppFedShared/tree/cells/SlotDescriptor.spec.ts',
      'src/app/libs/AppFedShared/tree/BareSlotChildren.spec.ts',
      'src/app/libs/AppFedShared/tree/descendant-rollups.spec.ts',
      'src/app/libs/AppFedShared/comments/field-comments.service.spec.ts',
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
