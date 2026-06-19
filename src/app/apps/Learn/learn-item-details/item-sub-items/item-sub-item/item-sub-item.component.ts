import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {LearnItem$} from '../../../models/LearnItem$'

@Component({
  standalone: false,
  selector: 'app-item-sub-item',
  templateUrl: './item-sub-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./item-sub-item.component.scss'],
})
export class ItemSubItemComponent implements OnInit {

  @Input() item$!: LearnItem$
  // @Input() item$!: OdmItem$2<any, any, any, any>

  constructor() { }

  ngOnInit() {}

}
