import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-tree-toolbar',
  templateUrl: './tree-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./tree-toolbar.component.scss'],
})
export class TreeToolbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
