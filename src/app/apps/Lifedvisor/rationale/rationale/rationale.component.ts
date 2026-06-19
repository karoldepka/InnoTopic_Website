import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-rationale',
  templateUrl: './rationale.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./rationale.component.scss']
})
export class RationaleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
