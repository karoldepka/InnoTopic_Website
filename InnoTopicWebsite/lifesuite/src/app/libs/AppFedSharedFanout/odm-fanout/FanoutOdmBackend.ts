import {Injectable, Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {OdmItem__OLD__} from '../../AppFedShared/odm/OdmItem__OLD__'
import {SupabaseOdmBackend} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-backend.service'
import {NeonOdmBackend} from '../../AppFedSharedNeon/odm-neon/neon-odm-backend.service'
import {MongoOdmBackend} from '../../AppFedSharedMongo/odm-mongo/mongo-odm-backend.service'
import {FanoutOdmCollectionBackend} from './FanoutOdmCollectionBackend'

/**
 * Supabase, Neon, and Mongo are treated as equal peers, not a primary + mirrors: every write goes
 * to all three and only resolves once all three confirm (durability over latency), and every read
 * races all three, forwarding whichever peer responds first with real data and backfilling the
 * other two from that response (see FanoutOdmCollectionBackend.raceQuery - an empty response never
 * preempts a real one still in flight, so a not-yet-backfilled Neon/Mongo can't shadow Supabase's
 * actual data even before the one-time backfill below finishes).
 *
 * On top of that per-query safety net, each FanoutOdmCollectionBackend backfills itself once, the
 * first time it's constructed (see its `backfillFromSupabase()`), pulling every existing item
 * straight from `backfillSourceBackend` (Supabase, which already has the full history) into
 * Neon+Mongo - so steady-state races settle on whichever peer is fastest instead of always waiting
 * out Neon/Mongo's empty responses. See the localStorage-flag guard there for why this runs once.
 */
@Injectable()
export class FanoutOdmBackend extends OdmBackend {
  readonly peerBackends: OdmBackend[]
  /** Supabase - already holds the full history, so it's the one-time backfill source for Neon
   * and Mongo. Kept as an explicit reference rather than relying on peerBackends[0]'s order. */
  readonly backfillSourceBackend: OdmBackend

  constructor(
    injector: Injector,
    supabaseOdmBackend: SupabaseOdmBackend,
    neonOdmBackend: NeonOdmBackend,
    mongoOdmBackend: MongoOdmBackend,
  ) {
    super(injector)
    this.peerBackends = [supabaseOdmBackend, neonOdmBackend, mongoOdmBackend]
    this.backfillSourceBackend = supabaseOdmBackend
    this.initDb()
  }

  createCollectionBackend<T extends OdmItem__OLD__<T>>(
    injector: Injector,
    className: string,
    opts: { dontStoreVersionHistory: boolean },
  ): FanoutOdmCollectionBackend<any> {
    return new FanoutOdmCollectionBackend<T>(injector, className, this, opts)
  }

  protected initDb() {
    this.authService.authUser$.subscribe(user => {
      if (user) {
        this.backendReady$.nextWithCache(true)
      }
    })
  }
}
