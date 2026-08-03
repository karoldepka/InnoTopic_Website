import {Component, Input, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import {Required} from '../../utils/angular/Required.decorator'
import {CachedSubject} from '../../utils/cachedSubject2/CachedSubject2'
import { NgFor, NgClass } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/** Considerations:
 * - acting on multiple selected items:
 *   - tri-state checkbox (yes, no, ~)
 * - using in filters (also yes no ~)
 * */
@Component({
    selector: 'app-chooser',
    templateUrl: './chooser.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./chooser.component.sass'],
    imports: [
        NgFor,
        IonicModule,
        NgClass,
    ],
})
export class ChooserComponent<TChoosable extends any = any> implements OnInit {

  @Required()
  @Input()
  allPossible: TChoosable[] = ['a', 'B'] as TChoosable[]

  @Output()
  chosen = new CachedSubject<TChoosable[]>([])

  constructor() { }

  ngOnInit() {}

  onClick(choosableClicked: TChoosable) {
    this.chosen.next(
      [...this.chosen.lastVal !, choosableClicked]
    )
  }

  isChosen(choosable: TChoosable) {
    return this.chosen.lastVal?.includes(choosable)
  }

  getTitle(choosable: any) {
    return choosable ?. title
      ?? choosable ?. name
      ?? choosable ?. id
      ?? choosable
  }
}
