import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgIf } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-node-class-picker',
    templateUrl: './node-class-picker.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./node-class-picker.component.sass'],
    imports: [NgIf, FaIconComponent]
})
export class NodeClassPickerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
