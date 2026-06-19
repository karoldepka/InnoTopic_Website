import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./energy.component.scss'],
})
export class EnergyComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
