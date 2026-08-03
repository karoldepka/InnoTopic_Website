import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core'
import {IonicModule} from '@ionic/angular'

/** Shared "toggle button that reveals projected content below" pattern - factored out so
 * `MinMidMaxCellComponent`'s own note field and `TreeNodeCellsComponent`'s per-slot
 * `CommentThreadComponent` (GH #89, "every field should be commentable-on") don't each hand-roll
 * their own open/closed button state. `:host { display: contents }` (see .sass) so this
 * component doesn't introduce its own flex/box - the button and the projected content lay out
 * as if they were direct children of whatever flex container hosts this component; give the
 * projected content `flex: 1 1 100%` in the host container's stylesheet so it wraps onto its own
 * full-width line (both current usages already have `flex-wrap: wrap` on that container). */
@Component({
  selector: 'app-expand-toggle',
  templateUrl: './expand-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./expand-toggle.component.sass'],
  imports: [IonicModule],
})
export class ExpandToggleComponent {

  @Input() isOpen = false
  @Output() isOpenChange = new EventEmitter<boolean>()

  @Input() icon = 'chatbubble-ellipses-outline'
  /** Omit both to get an icon-only button (e.g. the comment-thread toggle). */
  @Input() openLabel = ''
  @Input() closedLabel = ''

  /** Styles the button as "active" even while closed - e.g. the numeric cell's note field is
   * already non-empty, so it's visually flagged even before being expanded. */
  @Input() hasContent = false

  toggle(): void {
    this.setOpen(!this.isOpen)
  }

  setOpen(isOpen: boolean): void {
    this.isOpen = isOpen
    this.isOpenChange.emit(isOpen)
  }

}
