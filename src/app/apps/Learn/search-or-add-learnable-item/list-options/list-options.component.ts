import {Component, Injector, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ListOptionsData} from '../list-options'
import {PatchableObservable} from '../../../../libs/AppFedShared/utils/rxUtils'
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms'
import {FeatureService} from '../../../../libs/AppFedShared/feature.service'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import {OdmService2} from '../../../../libs/AppFedShared/odm/OdmService2'
import { IonicModule } from '@ionic/angular';
import { NgIf } from '@angular/common';
import { g } from '../../../../libs/AppFedShared/g'

@Component({
    selector: 'app-list-options',
    templateUrl: './list-options.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./list-options.component.sass'],
    imports: [
        IonicModule,
        NgIf,
        ReactiveFormsModule,
    ],
})
export class ListOptionsComponent extends BaseComponent implements OnInit {

  @Required()
  @Input()
  listOptions$P ! : PatchableObservable<ListOptionsData>

  @Required()
  @Input()
  itemsService ! : OdmService2<any, any /* FIXME narrow item-data typing */, any /* FIXME narrow item-view typing */, any>

  formControls = {
    range: new UntypedFormControl(),
    rangeEnabled: new UntypedFormControl(true),
  }

  features = this.featureService

  override readonly g = g

  constructor(
    public featureService: FeatureService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
    this.formControls.range.valueChanges.subscribe(x => {
      console.log(`this.formControls.range.valueChanges`, x)
    })
  }

  /** I could rewrite this settings + persistence stuff in e.g. mobxState tree */
  setPreset(preset: string) {
    this.listOptions$P.patchThrottled({
      preset
    })
  }

  setHideAiGenerated(checked: boolean) {
    this.listOptions$P.patchThrottled({ hideAiGenerated: checked })
  }

  setHideDrafts(checked: boolean) {
    this.listOptions$P.patchThrottled({ hideDrafts: checked })
  }

  setShowArchived(checked: boolean) {
    this.listOptions$P.patchThrottled({ showArchived: checked })
  }

  loadAll() {
    this.itemsService.loadAllItemsFromServer()
  }

  loadMore() {
    this.itemsService.loadNextPageFromServer()
  }
}
