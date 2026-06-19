import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-item-class-icon',
  templateUrl: './item-class-icon.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./item-class-icon.component.scss']
})
export class ItemClassIconComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
