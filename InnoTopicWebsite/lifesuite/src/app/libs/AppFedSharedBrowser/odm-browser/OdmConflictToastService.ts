import {Injectable} from '@angular/core'
import {Router} from '@angular/router'
import {ToastController} from '@ionic/angular'
import {BrowserOdmStorage, OdmConflict} from './BrowserOdmStorage'
import {presentDismissableToast} from '../../AppFedShared/utils/toast-utils'

/** Per-collection "open the winning item" URL builders. Not a generic cross-collection routing
 * contract - just what's registered so far. Collections without an entry here still get a
 * toast, just without an "Open" button. */
const COLLECTION_ROUTES: Record<string, (id: string) => string> = {
  LearnItem: id => `/learn/item/${id}`,
  JournalEntry: id => `/journal/entry/${id}`,
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
      this.presentConflictToast(conflict)
    })
  }

  private async presentConflictToast({collection, winnerId, loserConflictId}: OdmConflict): Promise<void> {
    const buildUrl = COLLECTION_ROUTES[collection]
    await presentDismissableToast(this.toastController, {
      message: `A conflicting edit was found in ${collection}. Kept the most recent version - the other is saved for recovery. Click to see details.`,
      duration: 8000,
      color: 'warning',
      position: 'bottom',
      buttons: [
        {text: 'View details', handler: () => this.router.navigate(['/conflicts', collection, winnerId, loserConflictId])},
        ...(buildUrl ? [{text: 'Open item', handler: () => this.router.navigateByUrl(buildUrl(winnerId))}] : []),
      ],
    })
  }
}
