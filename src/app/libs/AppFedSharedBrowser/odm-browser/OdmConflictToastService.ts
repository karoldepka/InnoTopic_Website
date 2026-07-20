import {Injectable} from '@angular/core'
import {Router} from '@angular/router'
import {ToastController} from '@ionic/angular'
import {BrowserOdmStorage} from './BrowserOdmStorage'

/** Per-collection "open the winning item" URL builders. Not a generic cross-collection routing
 * contract - just what's registered so far. Collections without an entry here still get a
 * toast, just without an "Open" button. */
const COLLECTION_ROUTES: Record<string, (id: string) => string> = {
  LearnItem: id => `/learn/item/${id}`,
  JournalEntry: id => `/journal/write/${id}`,
  OryItem: id => `/tree/${id}`,
}

/** Subscribes to BrowserOdmStorage.conflictDetected$ and surfaces each conflict as a toast, so
 * a best-effort automatic resolution (see docs/odm-incremental-sync-plan.md) is never silent -
 * the losing edit is always archived (BrowserOdmStorage.put) and the user is told about it. */
@Injectable({providedIn: 'root'})
export class OdmConflictToastService {
  constructor(
    private browserOdmStorage: BrowserOdmStorage,
    private toastController: ToastController,
    private router: Router,
  ) {
    this.browserOdmStorage.conflictDetected$.subscribe(conflict => {
      this.presentConflictToast(conflict.collection, conflict.winnerId)
    })
  }

  private async presentConflictToast(collection: string, winnerId: string): Promise<void> {
    const buildUrl = COLLECTION_ROUTES[collection]
    const toast = await this.toastController.create({
      message: `A conflicting edit was found in ${collection}. Kept the most recent version - the other is saved for recovery.`,
      duration: 8000,
      color: 'warning',
      position: 'bottom',
      buttons: buildUrl
        ? [{text: 'Open', handler: () => this.router.navigateByUrl(buildUrl(winnerId))}]
        : [],
    })
    await toast.present()
  }
}
