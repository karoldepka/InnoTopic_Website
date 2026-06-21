import {Component, Input, OnInit, ChangeDetectionStrategy, TrackByFunction} from '@angular/core';
import {LearnItemItemsService} from '../../core/learn-item-items.service'
import {ListProcessing} from '../list-processing'
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {LearnItem$} from '../../models/LearnItem$'
import { NgIf, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActionableItemComponent } from '../actionable-item/actionable-item.component';

@Component({
    selector: 'app-item-list',
    templateUrl: './item-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./item-list.component.sass'],
    imports: [
        NgIf,
        IonicModule,
        NgFor,
        ActionableItemComponent,
    ],
})
export class ItemListComponent implements OnInit {

  @Required()
  @Input()
  listModel ! : ListProcessing

  get filteredItem$s() { return this.listModel.filteredItem$s }

  get item$s() { return this.listModel.item$s }


  constructor(
    public learnDoService: LearnItemItemsService,
  ) { }

  ngOnInit() {}

  readonly trackByFn: TrackByFunction<LearnItem$> = (index, item) => item?.id

}
