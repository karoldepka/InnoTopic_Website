import {NgFor, NgIf} from '@angular/common'
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {IonicModule} from '@ionic/angular'
import diff, {Difference} from 'microdiff'
import {BrowserOdmRow, BrowserOdmStorage} from './BrowserOdmStorage'

interface ConflictDiffEntry {
  path: string
  archivedValue: unknown
  currentValue: unknown
  type: Difference['type']
}

/** Shows both locally retained versions of a resolved ODM conflict. The archived version stays
 * local-only by design, so this page reads it from BrowserOdmStorage rather than treating it as
 * a normal synced item. */
@Component({
  standalone: true,
  imports: [IonicModule, NgFor, NgIf],
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

        <ion-card *ngIf="winner && loser; else incompleteConflict">
          <ion-card-header>
            <ion-card-title>Changed fields</ion-card-title>
            <ion-card-subtitle>Archived version → current version</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p class="conflict-version-ids">
              <span>Archived: <code>{{ loserId }}</code></span>
              <span>Current: <code>{{ winnerId }}</code></span>
            </p>

            <p *ngIf="!diffEntries.length">The two saved versions have the same field values.</p>
            <section *ngFor="let entry of diffEntries" class="conflict-diff" [attr.aria-label]="'Changed field ' + entry.path">
              <h2>{{ entry.path }} <ion-note>({{ entry.type.toLowerCase() }})</ion-note></h2>
              <div class="conflict-diff__values">
                <div class="conflict-diff__value conflict-diff__value--archived">
                  <h3>Archived</h3>
                  <pre>{{ formatValue(entry.archivedValue) }}</pre>
                </div>
                <div class="conflict-diff__value conflict-diff__value--current">
                  <h3>Current</h3>
                  <pre>{{ formatValue(entry.currentValue) }}</pre>
                </div>
              </div>
            </section>
          </ion-card-content>
        </ion-card>
      </ng-container>

      <ng-template #loading><p>Loading conflict details…</p></ng-template>
      <ng-template #incompleteConflict>
        <p *ngIf="!winner">The current version is no longer available in this local cache.</p>
        <p *ngIf="!loser">The archived version is no longer available in this local cache.</p>
      </ng-template>
    </ion-content>
  `,
  styles: [`
    pre { white-space: pre-wrap; overflow-wrap: anywhere; font-size: .8rem; margin: 0; }
    code { overflow-wrap: anywhere; }
    .conflict-version-ids { display: grid; gap: .35rem; }
    .conflict-diff { border-top: 1px solid var(--ion-border-color); padding: .8rem 0; }
    .conflict-diff h2 { font-size: 1rem; margin: 0 0 .6rem; overflow-wrap: anywhere; }
    .conflict-diff h3 { font-size: .8rem; margin: 0 0 .35rem; }
    .conflict-diff__values { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; }
    .conflict-diff__value { border-radius: .4rem; padding: .6rem; }
    .conflict-diff__value--archived { background: rgba(255, 196, 9, .12); }
    .conflict-diff__value--current { background: rgba(45, 211, 111, .12); }
  `],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class OdmConflictDetailsPage implements OnInit {
  collection = ''
  winnerId = ''
  loserId = ''
  winner?: BrowserOdmRow<unknown>
  loser?: BrowserOdmRow<unknown>
  diffEntries: ConflictDiffEntry[] = []
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
    this.diffEntries = this.winner && this.loser
      ? this.buildDiff(this.loser.data, this.winner.data)
      : []
    this.loaded = true
  }

  formatValue(value: unknown): string {
    if (value === undefined) {
      return '(not set)'
    }
    return JSON.stringify(value, null, 2)
  }

  private buildDiff(archivedValue: unknown, currentValue: unknown): ConflictDiffEntry[] {
    return diff(
      this.toDiffableObject(archivedValue),
      this.toDiffableObject(currentValue),
    ).map(change => ({
      path: change.path.map(String).join('.') || '(whole item)',
      archivedValue: change.type === 'CREATE' ? undefined : change.oldValue,
      currentValue: change.type === 'REMOVE' ? undefined : change.value,
      type: change.type,
    }))
  }

  private toDiffableObject(value: unknown): Record<string, any> | any[] {
    return value !== null && typeof value === 'object'
      ? value as Record<string, any>
      : {value}
  }
}
