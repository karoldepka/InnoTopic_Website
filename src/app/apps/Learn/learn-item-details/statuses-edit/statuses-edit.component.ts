import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {LearnItem$} from '../../models/LearnItem$'
import {statusesArray} from '../../models/statuses.model'
import { ChooserComponent } from '../../../../libs/AppFedShared/chooser/chooser/chooser.component';

@Component({
    selector: 'app-statuses-edit',
    templateUrl: './statuses-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./statuses-edit.component.sass'],
    imports: [ChooserComponent],
})
export class StatusesEditComponent implements OnInit {

  @Input()
  @Required()
  public item$ ! : LearnItem$

  choosableStatuses = statusesArray

  constructor() { }

  ngOnInit() {}

}
