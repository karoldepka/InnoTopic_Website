import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../../../../environments/environment'
import { TranslatePipe } from '@ngx-translate/core';
import {DatePipe, NgFor, NgIf} from '@angular/common';

@Component({
    selector: 'app-about-app',
    templateUrl: './about-app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./about-app.component.scss'],
    imports: [TranslatePipe, NgFor, NgIf, DatePipe],
})
export class AboutAppComponent implements OnInit {
  readonly buildInfo = environment.buildInfo
  commitFilter = ''

  get filteredRecentCommits() {
    const filter = this.commitFilter.trim().toLocaleLowerCase()
    if (!filter) {
      return this.buildInfo.recentCommits
    }
    return this.buildInfo.recentCommits.filter(commit =>
      [commit.shortHash, commit.message, commit.author]
        .some(value => value.toLocaleLowerCase().includes(filter)))
  }

  constructor() { }

  ngOnInit() {}

}
