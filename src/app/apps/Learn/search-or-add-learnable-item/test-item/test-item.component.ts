import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {LearnItem} from '../../models/LearnItem'

@Component({
  standalone: false,
  selector: 'app-test-item',
  templateUrl: './test-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./test-item.component.sass'],
})
export class TestItemComponent implements OnInit {

  @Input() itemInp ? : LearnItem

  constructor() { }

  ngOnInit() {}

}
