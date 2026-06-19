import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-node-class-picker',
  templateUrl: './node-class-picker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./node-class-picker.component.sass']
})
export class NodeClassPickerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
