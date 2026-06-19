import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-what-next-button',
  templateUrl: './what-next-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./what-next-button.component.sass'],
})
export class WhatNextButtonComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
