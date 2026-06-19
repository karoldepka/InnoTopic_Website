import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-example-cell',
  templateUrl: './example-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./example-cell.component.sass']
})
export class ExampleCellComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
