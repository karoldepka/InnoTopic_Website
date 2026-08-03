import {Injectable} from '@angular/core'
import {ToastController} from '@ionic/angular'
import {BrowserOdmStorage} from './BrowserOdmStorage'
import {presentDismissableToast} from '../../AppFedShared/utils/toast-utils'

/** Subscribes to BrowserOdmStorage.connectionRecovered$ and surfaces a brief, reassuring toast,
 * so a local-cache connection drop (e.g. a tab left open across a deploy that bumps the
 * IndexedDB schema version) is never silently invisible - even though it's self-healing and
 * doesn't put the user's data at risk (see BrowserOdmStorage's class doc: this cache is a
 * best-effort mirror, not the source of truth a save depends on). Throttled like
 * SyncStatusService's network-error toast, so a burst of reconnects doesn't spam the user. */
@Injectable({providedIn: 'root'})
export class IndexedDbHealthToastService {
  private lastToastAt = 0

  constructor(
    private browserOdmStorage: BrowserOdmStorage,
    private toastController: ToastController,
  ) {
    this.browserOdmStorage.connectionRecovered$.subscribe(() => this.maybeShowToast())
  }

  private maybeShowToast(): void {
    const now = Date.now()
    if (now - this.lastToastAt < 15000) {
      return
    }
    this.lastToastAt = now
    presentDismissableToast(this.toastController, {
      message: 'Local storage had a brief hiccup and reconnected automatically - nothing was lost.',
      duration: 5000,
      color: 'warning',
      position: 'bottom',
    }).catch(error => console.error('IndexedDbHealthToastService maybeShowToast failed', error))
  }
}
