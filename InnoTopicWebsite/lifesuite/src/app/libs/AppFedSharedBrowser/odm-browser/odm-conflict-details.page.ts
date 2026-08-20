import {JsonPipe, NgIf} from '@angular/common'
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {IonicModule} from '@ionic/angular'
import {BrowserOdmRow, BrowserOdmStorage} from './BrowserOdmStorage'

/** Shows both locally retained versions of a resolved ODM conflict. The archived version stays
 * local-only by design, so this page reads it from BrowserOdmStorage rather than treating it as
 * a normal synced item. */
@Component({
  standalone: true,
  imports: [IonicModule, JsonPipe, NgIf],
  selector: 'app-odm-conflict-details',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/" /></ion-buttons>
        <ion-title>Conflict details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ng-container *ngIf="loaded; else loading">
        <ion-note color="warning">The most recent version remains active. The older version is retained locally for recovery.</ion-note>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Current version</ion-card-title>
            <ion-card-subtitle>{{ winner?.when_last_modified || 'No modification time recorded' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p><code>{{ winnerId }}</code></p>
            <pre *ngIf="winner; else missingWinner">{{ winner.data | json }}</pre>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Archived conflicting version</ion-card-title>
            <ion-card-subtitle>{{ loser?.when_last_modified || 'No modification time recorded' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p><code>{{ loserId }}</code></p>
            <pre *ngIf="loser; else missingLoser">{{ loser.data | json }}</pre>
          </ion-card-content>
        </ion-card>
      </ng-container>

      <ng-template #loading><p>Loading conflict details…</p></ng-template>
      <ng-template #missingWinner><p>The current version is no longer available in this local cache.</p></ng-template>
      <ng-template #missingLoser><p>The archived version is no longer available in this local cache.</p></ng-template>
    </ion-content>
  `,
  styles: [`
    pre { white-space: pre-wrap; overflow-wrap: anywhere; font-size: .8rem; }
    code { overflow-wrap: anywhere; }
  `],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class OdmConflictDetailsPage implements OnInit {
  collection = ''
  winnerId = ''
  loserId = ''
  winner?: BrowserOdmRow<unknown>
  loser?: BrowserOdmRow<unknown>
  loaded = false

  constructor(
    private route: ActivatedRoute,
    private browserOdmStorage: BrowserOdmStorage,
  ) {}

  async ngOnInit(): Promise<void> {
    this.collection = this.route.snapshot.paramMap.get('collection') ?? ''
    this.winnerId = this.route.snapshot.paramMap.get('winnerId') ?? ''
    this.loserId = this.route.snapshot.paramMap.get('loserId') ?? ''
    ;[this.winner, this.loser] = await Promise.all([
      this.browserOdmStorage.get<unknown>(this.collection, this.winnerId),
      this.browserOdmStorage.get<unknown>(this.collection, this.loserId),
    ])
    this.loaded = true
  }
}
