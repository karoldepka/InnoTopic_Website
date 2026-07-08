import {Component, Input, ChangeDetectionStrategy} from '@angular/core'
import {ModalController, IonicModule} from '@ionic/angular'

/** Full-size, in-app image popup - used by RichTextEditComponent's "click a pasted-image
 * thumbnail to see it full-size" feature (GH #32/#53). Deliberately not `window.open(objectUrl,
 * '_blank')`: an object URL is only valid within the document/tab that created it, and browsers
 * (Chrome's Blob URL Partitioning in particular) increasingly refuse to resolve it at all in a
 * separate tab - it also can never survive a reload or work in a different browser, which is
 * exactly what GH #53 reported. Rendering inline in a modal on the same page avoids the whole
 * class of problem instead of working around it. */
@Component({
  selector: 'app-image-viewer-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button (click)="close()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" (click)="close()">
      <img [src]="imageUrl" style="max-width: 100%; max-height: 100%; display: block; margin: auto; object-fit: contain" />
    </ion-content>
  `,
})
export class ImageViewerModalComponent {

  @Input() imageUrl!: string

  constructor(private modalController: ModalController) {
  }

  close() {
    this.modalController.dismiss()
  }
}
