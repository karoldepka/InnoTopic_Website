import {CommonModule} from '@angular/common'
import {Injector, NgModule} from '@angular/core'
import {HttpClientModule} from '@angular/common/http'
import {AngularFireModule} from '@angular/fire/compat'
import {AngularFireDatabaseModule} from '@angular/fire/compat/database'
import {AngularFirestoreModule} from '@angular/fire/compat/firestore'
import {AngularFirestore} from '@angular/fire/compat/firestore'
import {firebaseConfig} from '../../../firebase.config'
import {environment} from '../../../../environments/environment'
import {OdmBackend} from './OdmBackend'
import {OdmModule} from './odm.module'
import {FirestoreOdmBackend} from '../../AppFedSharedFirebase/odm-firestore/firestore-odm-backend.service'
import {SupabaseOdmBackend} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-backend.service'
import {SupabaseOdmClientService} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {NeonOdmBackend} from '../../AppFedSharedNeon/odm-neon/neon-odm-backend.service'

export function odmBackendFactory(injector: Injector): OdmBackend {
  const backendName = (environment as any).odmBackend ?? 'firestore'
  if (backendName === 'supabase') {
    return injector.get(SupabaseOdmBackend)
  }
  if (backendName === 'neon') {
    return injector.get(NeonOdmBackend)
  }
  return new FirestoreOdmBackend(injector, injector.get(AngularFirestore))
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    OdmModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
  ],
  providers: [
    SupabaseOdmClientService,
    SupabaseOdmBackend,
    NeonOdmBackend,
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
