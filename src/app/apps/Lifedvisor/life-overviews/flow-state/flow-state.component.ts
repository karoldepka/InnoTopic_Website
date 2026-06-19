import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-flow-state',
  templateUrl: './flow-state.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./flow-state.component.scss'],
})
export class FlowStateComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
