import {Injectable, Injector, Type} from '@angular/core'
import {environment} from '../../../../environments/environment'
import {JournalEntryItemsService} from '../../../apps/Journal/core/journal-entries.service'
import {VirtualSlotStatesOdmService} from '../virtual-slot-state/virtual-slot-states-odm.service'
import {SelfRatingHistoryOdmService} from '../../../apps/Lifedvisor/self-rating-history/self-rating-history-odm.service'
import {OryOdmItemsService} from '../../../apps/OrYoL/db-supabase/ory-odm-items.service'
import {OryNodeInclusionsOdmService} from '../../../apps/OrYoL/db-supabase/ory-node-inclusions-odm.service'
import {TimeTrackingPeriodsOdmService} from '../../../apps/OrYoL/time-tracking/time-tracking-periods-odm.service'
import {FieldCommentsOdmService} from '../comments/field-comments-odm.service'
import {JournalAiAdviceSettingsOdmService} from '../../../apps/Journal/journal-ai-advice/journal-ai-advice-settings-odm.service'
import {AiAdviceOdmService} from '../ai-advice/ai-advice-odm.service'
import {GenericItemsService} from '../tree/generic-items.service'
import {LearnItemItemsService} from '../../../apps/Learn/core/learn-item-items.service'
import {OdmBackfillProgressService} from './odm-backfill-progress.service'
import {FanoutOdmCollectionBackend} from '../../AppFedSharedFanout/odm-fanout/FanoutOdmCollectionBackend'

/** Every currently-known OdmService2 subclass with a static (not per-call-site-parameterized)
 * className. There's no registry these services self-report into, so this list has to be kept in
 * sync by hand whenever a new top-level collection is added - see syncAllKnownCollectionsNow(). */
const KNOWN_ODM_SERVICES: Type<unknown>[] = [
  JournalEntryItemsService,
  VirtualSlotStatesOdmService,
  SelfRatingHistoryOdmService,
  OryOdmItemsService,
  OryNodeInclusionsOdmService,
  TimeTrackingPeriodsOdmService,
  FieldCommentsOdmService,
  JournalAiAdviceSettingsOdmService,
  AiAdviceOdmService,
  GenericItemsService,
  LearnItemItemsService,
]

/** Normally each collection's one-time Supabase -> Neon+Mongo backfill (see
 * FanoutOdmCollectionBackend.backfillFromSupabase) only runs once you happen to open the app
 * section that uses it, since Angular only constructs a `providedIn: 'root'` service the first
 * time something actually injects it. This service exists to force that eagerly, for every known
 * collection at once, instead of needing to click through every app section by hand. */
@Injectable({
  providedIn: 'root',
})
export class OdmFullSyncService {
  constructor(
    private injector: Injector,
    readonly backfillProgress: OdmBackfillProgressService,
  ) {
  }

  /** Starts a fresh Supabase-to-peer replication for every known collection, including ones whose
   * automatic one-time backfill was previously marked complete. */
  syncAllKnownCollectionsNow(): void {
    if ((environment as any).odmBackend !== 'fanout') {
      return
    }
    for (const ServiceClass of KNOWN_ODM_SERVICES) {
      const service = this.injector.get(ServiceClass) as {odmCollectionBackend?: unknown}
      const backend = service.odmCollectionBackend
      if (backend instanceof FanoutOdmCollectionBackend) {
        void backend.syncFromSupabaseNow()
      }
    }
  }
}
