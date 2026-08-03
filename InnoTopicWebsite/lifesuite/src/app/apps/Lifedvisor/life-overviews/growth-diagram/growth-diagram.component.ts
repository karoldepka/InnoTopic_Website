import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-growth-diagram',
    templateUrl: './growth-diagram.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./growth-diagram.component.css']
})
export class GrowthDiagramComponent implements OnInit {

  alert = window.alert

  constructor() { }

  ngOnInit() {
  }

}
