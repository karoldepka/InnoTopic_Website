import {ChangeDetectorRef, Component, Injector, Input, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {sidesDefs, sidesDefsArray} from '../../core/sidesDefs'
import {LearnItem} from '../../models/LearnItem'
import {funLevelsDescriptors} from '../../models/fields/fun-level.model'
import {importanceDescriptors} from '../../models/fields/importance.model'
import {debugLog} from '../../../../libs/AppFedShared/utils/log'
import {SelectionManager} from '../SelectionManager'
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {LearnItem$} from '../../models/LearnItem$'
import {FeatureService} from '../../../../libs/AppFedShared/feature.service'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { SelectionCheckboxComponent } from './selection-checkbox/selection-checkbox.component';
import { PlayButtonComponent } from '../../shared/play-button/play-button.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';


/* TODO rename to  list-item */
@Component({
    selector: 'app-actionable-item',
    templateUrl: './actionable-item.component.html',
    // OnPush: this renders once per item in a list that can be in the thousands - with the
    // previous Eager (check-always) strategy, every zone.js tick anywhere in the app (e.g. each
    // keystroke in the unrelated search box) walked and re-evaluated every single item's
    // template (several method calls + several *ngIf-s each), which is what made typing feel
    // slow. Reactivity for data that isn't covered by a plain @Input reference change (the
    // item's own field values, and selection-mode toggling) is restored via explicit
    // markForCheck() below, driven off the same observables the rest of the ODM/selection layer
    // already emits on.
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./actionable-item.component.sass'],
    imports: [
        IonicModule,
        RouterLink,
        NgIf,
        SelectionCheckboxComponent,
        PlayButtonComponent,
    ],
})
export class ActionableItemComponent extends BaseComponent implements OnInit, OnDestroy {

  sidesDefsArray = sidesDefsArray

  _item ! : LearnItem$

  private itemValSubscription ? : Subscription
  private selectionSubscription ? : Subscription

  @Required()
  @Input() selection ! : SelectionManager

  @Input() set item(item: LearnItem$) {
    this._item = item
    this.itemValSubscription?.unsubscribe()
    this.itemValSubscription = item.val$.subscribe(() => this.changeDetectorRef.markForCheck())
  }

  get item() { return this._item }

  get item$() { return this._item }

  // @Required()
  @Input() index ! : number

  constructor(
    public featureService: FeatureService,
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
    this.selectionSubscription = this.selection.effectiveSelectionChange$
      .subscribe(() => this.changeDetectorRef.markForCheck())
  }

  ngOnDestroy() {
    this.itemValSubscription?.unsubscribe()
    this.selectionSubscription?.unsubscribe()
  }

  joinedSides() {
    return this.item?.val?.joinedSides?.()
  }

  joinedSidesOneLine(): SafeHtml | undefined {
    const html = this.joinedSides()
      ?.replaceAll('<p>', ' ')
      ?.replaceAll('</p>', ' ')
    if ( ! html ) return undefined
    return this.sanitizer.bypassSecurityTrustHtml(html)
  }

  getFunLevelDescriptor() {
    const funEstimateVal = this.item.val?.funEstimate
    if ( funEstimateVal ) {
      return funLevelsDescriptors.descriptors[funEstimateVal.id]
    }
    return undefined
  }

  getPhysicalHealthImpactLevelDescriptor() {
    if ( ! this.item$.getEffectivePhysicalHealthImpact ) {
      console.log('this.item$.getEffectivePhysicalHealthImpact ...', this.item$)

    }
    try {
      const val = this.item$.getEffectivePhysicalHealthImpact()
      if ( val ) {
        return funLevelsDescriptors.descriptors[val.id]
      }
      return undefined
    } catch (e) {
      console.log('    const val = this.item$.getEffectivePhysicalHealthImpact()\n', this.item$)
    }
  }

  getMentalHealthImpactLevelDescriptor() {
    const val = this.item$.getEffectiveMentalHealthImpact()
    if ( val ) {
      return funLevelsDescriptors.descriptors[val.id]
    }
    return undefined
  }

  /** FIXME: move to Item class */
  getImportanceDescriptor() {
    const val = this.item.val?.importance
    if ( val ) {
      return importanceDescriptors[val.id]
    }
    return undefined
  }

  editEstimate() {
    debugLog(`editEstimate()`)
  }

  addToToday(event: any) {
    event.stopPropagation()
  }
}
