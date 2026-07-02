import {Injectable, Injector} from '@angular/core';
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {appGlobals} from '../g'
import {BaseService} from '../base.service'
import {QueryOpts} from './OdmCollectionBackend'

export class SyncStatus {
  pendingUploadsCount ? : number
  pendingDownloadsCount ? : number
  isAllSynced ! : boolean
  pendingUploads ! : Set<PendingUpload>
  pendingDownloads ! : Set<PendingDownload>
}

/** A user-visible description of a change that is waiting to be uploaded. */
export interface PendingUpload {
  titleOfChange?: string
}

/** consider putting 'titleOfChange' here */
type SyncTask = Promise<any> | {then: any}

export type PendingDownload = QueryOpts

@Injectable({
  providedIn: 'root'
})
export class SyncStatusService extends BaseService {

  pendingPromises = new Set<SyncTask>()

  pendingUploads = new Set<PendingUpload>()

  pendingDownloads = new Set<PendingDownload>()

  public readonly syncStatus$ = new CachedSubject<SyncStatus>(
    {
      isAllSynced: true /* fix for oryol page sync checkmark not showing */,
      pendingUploads: new Set(),
      pendingDownloads: new Set(),
    }
  )

  get hasPendingUploads() {
    return this.syncStatus$.lastVal ?. pendingUploadsCount
  }

  constructor(
    injector: Injector,
  ) {
    super(injector)
    console.log('SyncStatusService service constructor')
  }

  /** crude placeholder to distinguish "Unsaved" From "Saving...";
   * later unify unsaved -> saving; and even provide link to item/node in question, and original and new value; and cells/columns names
   *
   * it can contain multiple changes;
   * multiple batches could be pending "on" same object, if slow internet;
   * if offline, they can prolly keep accumulating; maybe they should overwrite previous ones
   * */
  handleUnsavedPromise(promise: SyncTask, titleOfChange?: string) {
    this.handleSavingPromise(promise, titleOfChange)
  }

  handleSavingPromise(promise: SyncTask, titleOfChange?: string) {
    this.pendingPromises.add(promise)
    const pendingUpload: PendingUpload = { titleOfChange }
    this.pendingUploads.add(pendingUpload)
    this.emitSyncStatus()
    promise.then(() => {
      this.pendingPromises.delete(promise)
      this.pendingUploads.delete(pendingUpload)
      this.emitSyncStatus()
    }).catch((error: any) => {
      // Bug fix: this branch never cleared pendingUpload/pendingPromises on failure, leaving
      // the "saving..." indicator stuck forever. The backend that rejected this promise
      // already alerted/logged as appropriate for its own silentErrors setting (e.g. a
      // degraded-offline Supabase write shouldn't pop a second blocking alert here on top of
      // that) - just log, don't alert again.
      console.error('Unable to save:', titleOfChange, error)
      this.pendingPromises.delete(promise)
      this.pendingUploads.delete(pendingUpload)
      this.emitSyncStatus()
    })
  }

  private emitSyncStatus() {
    const val = {
      pendingUploadsCount: this.pendingPromises.size,
      pendingDownloadsCount: this.pendingDownloads.size,
      isAllSynced: !this.pendingPromises.size && !this.pendingDownloads.size,
      pendingUploads: this.pendingUploads,
      pendingDownloads: this.pendingDownloads
    }
    // if ( appGlobals.feat.showDebug ) {
    //   console.log(`emitSyncStatus`, val, this.pendingDownloads)
    // }
    this.syncStatus$.next(val)
  }

  addPendingDownload(downloadInProgress: PendingDownload) {
    this.pendingDownloads.add(downloadInProgress)
    this.emitSyncStatus()
  }

  removePendingDownload(downloadInProgress: PendingDownload) {
    this.pendingDownloads.delete(downloadInProgress)
    this.emitSyncStatus()
  }

}
