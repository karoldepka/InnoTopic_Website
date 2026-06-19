import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {LearnItem$} from '../../models/LearnItem$'
import {statusesArray} from '../../models/statuses.model'

@Component({
  standalone: false,
  selector: 'app-statuses-edit',
  templateUrl: './statuses-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./statuses-edit.component.sass'],
})
export class StatusesEditComponent implements OnInit {

  @Input()
  @Required()
  public item$ ! : LearnItem$

  choosableStatuses = statusesArray

  constructor() { }

  ngOnInit() {}

}
