import {Component, Injector, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
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


/* TODO rename to  list-item */
@Component({
    selector: 'app-actionable-item',
    templateUrl: './actionable-item.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./actionable-item.component.sass'],
    imports: [
        IonicModule,
        RouterLink,
        NgIf,
        SelectionCheckboxComponent,
        PlayButtonComponent,
    ],
})
export class ActionableItemComponent extends BaseComponent implements OnInit {

  sidesDefsArray = sidesDefsArray

  _item ! : LearnItem$

  @Required()
  @Input() selection ! : SelectionManager

  @Input() set item(item: LearnItem$) {
    if ( this._item ) {
      // console.log('set item to new one')
    }

    this._item = item
  }

  get item() { return this._item }

  get item$() { return this._item }

  // @Required()
  @Input() index ! : number

  // @Input() search: string

  // @Input() set item(i: LearnItem) {
  //   console.log(`@Input() set item`, i)
  //   this._item = i
  //   this.changeDetectorRef.detectChanges()
  // }
  //
  // get item() {
  //   return this._item
  // }

  constructor(
    public featureService: FeatureService,
    private sanitizer: DomSanitizer,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

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
