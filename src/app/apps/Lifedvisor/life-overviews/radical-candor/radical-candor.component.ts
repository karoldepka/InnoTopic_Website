import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-radical-candor',
  templateUrl: './radical-candor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./radical-candor.component.scss'],
})
export class RadicalCandorComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
