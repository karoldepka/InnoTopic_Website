import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-energy-graph',
  templateUrl: './energy-graph.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./energy-graph.component.scss'],
})
export class EnergyGraphComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
