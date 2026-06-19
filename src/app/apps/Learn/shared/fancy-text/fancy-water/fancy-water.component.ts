import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-fancy-water',
  templateUrl: './fancy-water.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./fancy-water.component.sass'],
})
export class FancyWaterComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
