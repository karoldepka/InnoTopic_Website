import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {LearnStatsService} from '../../core/learn-stats.service'
import { NgIf, NgFor, AsyncPipe, JsonPipe, KeyValuePipe } from '@angular/common';

@Component({
    selector: 'app-learn-stats',
    templateUrl: './learn-stats.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./learn-stats.component.sass'],
    imports: [
        NgIf,
        NgFor,
        AsyncPipe,
        JsonPipe,
        KeyValuePipe,
    ],
})
export class LearnStatsComponent implements OnInit {

  public stats$ = this.learnStatsService.stats$

  showStats = false

  constructor(
    public learnStatsService: LearnStatsService,
  ) { }

  ngOnInit() {}

}
