import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AsyncPipe, NgIf} from '@angular/common';
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {PatchableObservable} from '../../../../libs/AppFedShared/utils/rxUtils'
import {JournalEntry} from '../../models/JournalEntry'
import {TimelineListOptionsData} from '../journal-entries-list.page'
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms'
import {OdmService2} from '../../../../libs/AppFedShared/odm/OdmService2'
import {errorAlert} from '../../../../libs/AppFedShared/utils/log'
import { IonicModule } from '@ionic/angular';
import {g} from '../../../../libs/AppFedShared/g'

@Component({
    selector: 'app-timeline-list-options',
    templateUrl: './timeline-list-options.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./timeline-list-options.component.sass'],
    imports: [IonicModule, ReactiveFormsModule, AsyncPipe, NgIf],
})
export class TimelineListOptionsComponent implements OnInit {

  public g = g

  @Required()
  @Input()
  listOptions$P ! : PatchableObservable<TimelineListOptionsData>

  @Required()
  @Input()
  itemsService ! : OdmService2<any, any /* FIXME narrow item-data typing */, any /* FIXME narrow item-view typing */, any>


  formControl = new UntypedFormControl()

  formControls = {
    range: new UntypedFormControl()
  }


  constructor() { }

  ngOnInit() {
    // The checkbox reads "Sort descending", but the stored/sorted-on field is sortAscending -
    // sync the inverse instead of using createViewSyncerForField's direct pass-through, which
    // would make checking "Sort descending" set sortAscending=true (i.e. actually sort
    // ascending). Keeping the stored field name as sortAscending avoids a localStorage
    // migration for the 'TimelineList_Options' key.
    this.listOptions$P.locallyVisibleChanges$.subscribe(options => {
      const sortDescendingChecked = options.sortAscending !== true
      if (this.formControl.value !== sortDescendingChecked) {
        this.formControl.setValue(sortDescendingChecked, {emitEvent: false})
      }
    })
    this.formControl.valueChanges.subscribe(sortDescendingChecked => {
      this.listOptions$P.patchThrottled({sortAscending: !sortDescendingChecked})
    })

    this.formControls.range.valueChanges.subscribe(value => {
      console.log('value', value)
    })
  }

  loadAll(b: boolean) {
    this.itemsService.loadAllItemsFromServer()
  }
}
