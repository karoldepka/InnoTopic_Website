import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-what-next-button',
    templateUrl: './what-next-button.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./what-next-button.component.sass'],
    imports: [IonicModule, RouterLink],
})
export class WhatNextButtonComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
