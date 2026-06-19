import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {LearnStatsService} from '../../core/learn-stats.service'

@Component({
  standalone: false,
  selector: 'app-learn-stats',
  templateUrl: './learn-stats.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./learn-stats.component.sass'],
})
export class LearnStatsComponent implements OnInit {

  public stats$ = this.learnStatsService.stats$

  showStats = false

  constructor(
    public learnStatsService: LearnStatsService,
  ) { }

  ngOnInit() {}

}
