import {Injectable, Injector} from '@angular/core';
import {ToastController} from '@ionic/angular'
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {appGlobals} from '../g'
import {BaseService} from '../base.service'
import {QueryOpts} from './OdmCollectionBackend'
import {BrowserOdmStorage, OdmPendingEdit, PendingBlobUpload} from '../../AppFedSharedBrowser/odm-browser/BrowserOdmStorage'

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

  /** Reload-surviving "still needs to reach the server" list, sourced from BrowserOdmStorage's
   * durable pending-edits journal rather than in-memory promises. Unlike `pendingUploads` above
   * (which only reflects a save actively in flight *this session*, and previously cleared itself
   * the instant a save failed even though the edit was still durably queued for retry), this
   * stays populated across a page reload and across a failed/offline attempt - until the write
   * actually confirms. */
  public readonly durablePendingSyncItems$ = new CachedSubject<OdmPendingEdit[]>([])

  /** Same reload-surviving "still needs to reach the server" role as `durablePendingSyncItems$`
   * above, but for BlobSyncService's image/audio uploads instead of row patches. */
  public readonly durablePendingBlobUploads$ = new CachedSubject<PendingBlobUpload[]>([])

  private browserOdmStorage = this.injector.get(BrowserOdmStorage)

  private lastNetworkErrorToastAt = 0

  constructor(
    injector: Injector,
  ) {
    super(injector)
    console.log('SyncStatusService service constructor')
    this.refreshDurablePendingSyncItems()
    this.browserOdmStorage.pendingEditsChanged$.subscribe(() => this.refreshDurablePendingSyncItems())
    this.refreshDurablePendingBlobUploads()
    this.browserOdmStorage.pendingBlobUploadsChanged$.subscribe(() => this.refreshDurablePendingBlobUploads())
  }

  private refreshDurablePendingSyncItems() {
    this.browserOdmStorage.getAllPendingEditsEverywhere()
      .then(items => this.durablePendingSyncItems$.next(items))
      .catch(error => console.error('refreshDurablePendingSyncItems failed', error))
  }

  private refreshDurablePendingBlobUploads() {
    this.browserOdmStorage.getAllPendingBlobUploadsEverywhere()
      .then(items => this.durablePendingBlobUploads$.next(items))
      .catch(error => console.error('refreshDurablePendingBlobUploads failed', error))
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
      this.maybeShowNetworkErrorToast(error)
    })
  }

  /** A failed save while offline is expected, not an error the user needs to act on - the edit
   * is already durably queued (durablePendingSyncItems$) and will retry automatically on
   * reconnect. Surface that plainly instead of leaving it silent (console-only) or looking like
   * a real failure. Throttled so a burst of failures (e.g. several offline edits all retrying at
   * once) doesn't spam multiple toasts. */
  private maybeShowNetworkErrorToast(error: any) {
    if (!this.isLikelyNetworkError(error)) {
      return
    }
    const now = Date.now()
    if (now - this.lastNetworkErrorToastAt < 15000) {
      return
    }
    this.lastNetworkErrorToastAt = now
    this.injector.get(ToastController).create({
      message: 'Network problem - your change is saved on this device and will sync automatically once you\'re back online.',
      duration: 6000,
      color: 'warning',
      position: 'bottom',
    }).then(toast => toast.present())
      .catch(toastError => console.error('maybeShowNetworkErrorToast failed', toastError))
  }

  private isLikelyNetworkError(error: any): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true
    }
    const message = String(error?.cause?.message ?? error?.message ?? error ?? '')
    return /failed to fetch|networkerror|network request failed|load failed|err_internet_disconnected|err_network/i.test(message)
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
