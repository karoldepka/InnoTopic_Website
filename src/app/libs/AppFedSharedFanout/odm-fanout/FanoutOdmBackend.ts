import {Injectable, Injector} from '@angular/core'
import {AngularFirestore} from '@angular/fire/compat/firestore'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {OdmItem__OLD__} from '../../AppFedShared/odm/OdmItem__OLD__'
import {FirestoreOdmBackend} from '../../AppFedSharedFirebase/odm-firestore/firestore-odm-backend.service'
import {SupabaseOdmBackend} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-backend.service'
import {NeonOdmBackend} from '../../AppFedSharedNeon/odm-neon/neon-odm-backend.service'
import {FanoutOdmCollectionBackend} from './FanoutOdmCollectionBackend'
import {environment} from '../../../../environments/environment'

/**
 * Firestore stays the primary/source-of-truth backend for reads during the migration.
 * Every write goes to Firestore, Supabase, and Neon; every item read back from Firestore
 * is also mirrored into Supabase and Neon, so historical data gets backfilled into Postgres
 * just by being loaded in the app, without a separate migration script.
 */
@Injectable()
export class FanoutOdmBackend extends OdmBackend {
  readonly primaryBackend: OdmBackend
  readonly secondaryBackends: OdmBackend[]

  constructor(
    injector: Injector,
    angularFirestore: AngularFirestore,
    supabaseOdmBackend: SupabaseOdmBackend,
    neonOdmBackend: NeonOdmBackend,
  ) {
    super(injector)
    this.primaryBackend = new FirestoreOdmBackend(injector, angularFirestore)
    // Neon isn't wired up (no server / connection string) yet - keep the adapter implemented
    // but leave it out of the fanout until environment.neon.enabled is turned back on.
    const neonEnabled = (environment as any).neon?.enabled ?? true
    this.secondaryBackends = [supabaseOdmBackend, ...(neonEnabled ? [neonOdmBackend] : [])]
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
