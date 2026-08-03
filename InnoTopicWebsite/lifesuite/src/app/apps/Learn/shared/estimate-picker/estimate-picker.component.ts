import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-estimate-picker',
  templateUrl: './estimate-picker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./estimate-picker.component.sass'],
})
export class EstimatePickerComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
