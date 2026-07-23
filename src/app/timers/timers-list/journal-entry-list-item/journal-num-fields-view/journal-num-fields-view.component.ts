import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {JournalEntry$} from '../../../../apps/Journal/models/JournalEntry$'
import {JournalNumericDescriptors} from '../../../../apps/Journal/models/JournalNumericDescriptors'
import {nullish} from '../../../../libs/AppFedShared/utils/type-utils'
import {JournalEntry} from '../../../../apps/Journal/models/JournalEntry'
import {CachedSubject} from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import {FeatureService} from '../../../../libs/AppFedShared/feature.service'

@Component({
    selector: 'app-journal-num-fields-view',
    templateUrl: './journal-num-fields-view.component.html',
    styleUrls: ['./journal-num-fields-view.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgFor, NgIf, AsyncPipe],
})
export class JournalNumFieldsViewComponent implements OnInit {

  // numDescriptors = [ JournalNumericDescriptors.instance.array [0] ]
  numDescriptors = JournalNumericDescriptors.instance.array

  @Input() item$ ! : JournalEntry$

  get val$(): CachedSubject<JournalEntry | nullish> {
    return this.item$.val$
  }

  constructor(
    private featureService: FeatureService,
  ) { }

  ngOnInit() {}

  get compactStarRatings(): boolean {
    return this.featureService.journalCompactStarRatings
  }

  /** GH #106: the stored value is 0-10 (half-point increments) - halving it converts to a 0-5
   * scale in quarter-point increments while landing on the exact same set of "nice" numbers
   * (`.0`/`.25`/`.5`/`.75`). Deliberately just `String(...)`, not a fixed decimal count - JS's own
   * number-to-string already drops trailing zeros (`4` stays `4`, not `4.00`), which is the
   * "most compact possible" the issue asks for without a bespoke formatter. */
  formatAsFiveScale(rawTenScaleValue: number): string {
    return String(rawTenScaleValue / 2)
  }

}
