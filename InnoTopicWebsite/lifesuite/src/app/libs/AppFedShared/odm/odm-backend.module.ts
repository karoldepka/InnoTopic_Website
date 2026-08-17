import {CommonModule} from '@angular/common'
import {Injector, NgModule} from '@angular/core'
import {HttpClientModule} from '@angular/common/http'
import {environment} from '../../../../environments/environment'
import {OdmBackend} from './OdmBackend'
import {OdmModule} from './odm.module'
import {FirestoreOdmBackend} from '../../AppFedSharedFirebase/odm-firestore/firestore-odm-backend.service'
import {SupabaseOdmBackend} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-backend.service'
import {SupabaseOdmClientService} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {NeonOdmBackend} from '../../AppFedSharedNeon/odm-neon/neon-odm-backend.service'
import {MongoOdmBackend} from '../../AppFedSharedMongo/odm-mongo/mongo-odm-backend.service'
import {SurrealOdmBackend} from '../../AppFedSharedSurreal/odm-surreal/surreal-odm-backend.service'
import {FanoutOdmBackend} from '../../AppFedSharedFanout/odm-fanout/FanoutOdmBackend'
import {CachingOdmBackend} from '../../AppFedSharedFanout/odm-fanout/CachingOdmBackend'
import {BrowserOdmBackend} from '../../AppFedSharedBrowser/odm-browser/BrowserOdmBackend'

/** `browser` is a valid, reachable backend (a real IndexedDB-only ODM backend) but nothing
 * selects it as the primary today - it's reserved for a future "recover from local cache when
 * the server is unreachable" mode. Every other backend is wrapped with `CachingOdmBackend` so
 * everything read/written mirrors into that same local cache as a side effect in the meantime. */
export function odmBackendFactory(injector: Injector): OdmBackend {
  const backendName = (environment as any).odmBackend ?? 'firestore'
  if (backendName === 'browser') {
    return injector.get(BrowserOdmBackend)
  }
  const primaryBackend = resolvePrimaryBackend(injector, backendName)
  return new CachingOdmBackend(injector, primaryBackend, injector.get(BrowserOdmBackend))
}

function isFirestoreEnabled(): boolean {
  const stored = localStorage.getItem('firestoreEnabled')
  return stored === null ? true : stored === 'true'
}

function resolvePrimaryBackend(injector: Injector, backendName: string): OdmBackend {
  if (backendName === 'supabase') {
    return injector.get(SupabaseOdmBackend)
  }
  if (backendName === 'neon') {
    return injector.get(NeonOdmBackend)
  }
  if (backendName === 'fanout') {
    // Unlike the 'firestore' branch below, fanout mode's peers are Supabase/Neon/Mongo/Surreal -
    // it never touches Firestore, so isFirestoreEnabled() has no bearing here.
    return injector.get(FanoutOdmBackend)
  }
  // backendName === 'firestore'
  if (!isFirestoreEnabled()) {
    console.warn('[ODM] Firestore disabled via settings — using Supabase as primary')
    return injector.get(SupabaseOdmBackend)
  }
  return new FirestoreOdmBackend(injector)
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    OdmModule,
  ],
  providers: [
    SupabaseOdmClientService,
    SupabaseOdmBackend,
    NeonOdmBackend,
    MongoOdmBackend,
    SurrealOdmBackend,
    FanoutOdmBackend,
    BrowserOdmBackend,
    {
      provide: OdmBackend,
      useFactory: odmBackendFactory,
      deps: [Injector],
    },
  ],
  exports: [
    OdmModule,
  ],
})
export class OdmBackendModule { }
