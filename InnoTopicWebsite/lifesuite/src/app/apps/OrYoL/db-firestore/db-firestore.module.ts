import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FirestoreTreeService} from './firestore-tree.service'
import {DbTreeService} from '../tree-model/db-tree-service'
import {SupabaseTreeService} from '../db-supabase/supabase-tree.service'
import {environment} from '../../../../environments/environment'

/** OrYoL (/tree) is being migrated off Firestore onto the shared ODM/Supabase sync engine (see
 * the OrYoL tree migration plan) - toggled the same way OdmBackendModule.odmBackendFactory picks
 * between backends, so there's a clean rollback path during the migration. */
export function dbTreeServiceFactory(injector: Injector): DbTreeService {
  const backendName = (environment as any).oryolTreeBackend ?? 'firestore'
  if (backendName === 'supabase') {
    return injector.get(SupabaseTreeService)
  }
  return injector.get(FirestoreTreeService)
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

  ],
  providers: [
    FirestoreTreeService,
    SupabaseTreeService,
    {
      provide: DbTreeService,
      useFactory: dbTreeServiceFactory,
      deps: [Injector],
    },
  ]
})
export class DbFirestoreModule { }
