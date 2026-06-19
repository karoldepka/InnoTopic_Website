import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-cell-host',
  templateUrl: './cell-host.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./cell-host.component.sass']
})
export class CellHostComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
