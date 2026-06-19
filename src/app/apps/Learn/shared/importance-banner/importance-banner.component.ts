import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {LearnItem$} from '../../models/LearnItem$'

@Component({
  standalone: false,
  selector: 'app-importance-banner',
  templateUrl: './importance-banner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./importance-banner.component.sass'],
})
export class ImportanceBannerComponent implements OnInit {

  @Input()
  item$ ? : LearnItem$

  get importance() {
    return this.item$?.getEffectiveImportance()?.id?.replace(/_/g, ' ')
  }

  constructor() { }

  ngOnInit() {}

}
