import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-test-item',
  templateUrl: './test-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./test-item.component.scss'],
})
export class TestItemComponent implements OnInit {

  @Input() itemInput!: string

  constructor() { }

  ngOnInit() {}

}
