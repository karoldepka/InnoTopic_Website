import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-learn-item-details-hints',
    templateUrl: './learn-item-details-hints.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./learn-item-details-hints.component.scss'],
    imports: [NgIf],
})
export class LearnItemDetailsHintsComponent implements OnInit {

  showDetails = false

  constructor() { }

  ngOnInit() {}

}
