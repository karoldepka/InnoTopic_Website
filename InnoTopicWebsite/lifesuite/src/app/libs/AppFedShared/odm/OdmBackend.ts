import {Injector} from "@angular/core";
import {OdmCollectionBackend} from "./OdmCollectionBackend";
// import {CachedSubject} from "../utils/CachedSubject2";


// import * as firebase from 'firebase';

// import Timestamp = firebase.firestore.Timestamp
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {AuthService} from '../../../auth/auth.service'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import Timestamp = firebase.firestore.Timestamp

export type OdmTimestamp = Timestamp

export abstract class OdmBackend {

  backendReady$ = new CachedSubject<boolean>()

  authService = this.injector.get(AuthService)

  protected constructor(
    protected injector: Injector,
  ) {
  }

  abstract createCollectionBackend<TRaw>(
    injector: Injector, className: string,
    opts: {dontStoreVersionHistory: boolean}
  ): OdmCollectionBackend<TRaw>

  /** Human-readable list of where a save actually goes (e.g. "Supabase, Neon, Mongo, Surreal" for
   * the fanout backend) - '' for a single-destination backend, where naming it would be redundant
   * with the "Saving X" text it's appended to. Lets the sync-status popover show which databases a
   * pending upload is actually waiting on, instead of one opaque "Saving..." entry that gives no
   * indication several backends are involved (see FanoutOdmBackend's override). */
  describeSaveDestination(): string {
    return ''
  }

  static nowTimestamp() {
    return Timestamp.now()
  }

  static timestampFromMillis(milliseconds: number): OdmTimestamp {
    return Timestamp.fromMillis(milliseconds)
  }

}
