import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'

@Component({
  standalone: false,
  selector: 'app-mindfulness',
  templateUrl: './mindfulness.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./mindfulness.page.sass'],
})
export class MindfulnessPage extends BaseComponent implements OnInit {

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
  }

}
