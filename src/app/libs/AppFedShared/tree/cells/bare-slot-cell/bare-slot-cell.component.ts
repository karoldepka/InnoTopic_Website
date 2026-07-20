import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core'
import {AsyncPipe} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {IonicModule} from '@ionic/angular'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {OdmItem$2} from '../../../odm/OdmItem$2'
import {odmTimestampToMillis} from '../../../odm/utils'
import {createChildUnderSlot, getBareSlotChildren$} from '../../BareSlotChildren'
import {VoiceMemoFieldComponent} from '../../../audio/voice-memo-field/voice-memo-field.component'
import {DatePipe} from '@angular/common'

/** A bare slot (GH #89's `kind: 'slot'` descriptor, e.g. a former OrYoL/Learn template node like
 * "Plan") - no scalar value of its own, just a live-filtered list of the parent's real children
 * that were tagged with this slot's fabricated id (see `BareSlotChildren.ts`) plus an affordance
 * to add another. Rendered by `TreeNodeCellsComponent` alongside `MinMidMaxCellComponent`/
 * `RichTextEditCellComponent` for the other two `SlotKind`s - it isn't an `AbstractCellComponent`
 * itself (no single editable value/`OdmCell` to bind), but the comment-thread and time-tracking
 * toggles around it work identically since both key off the same fabricated `targetNodeId`. */
@Component({
  selector: 'app-bare-slot-cell',
  templateUrl: './bare-slot-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./bare-slot-cell.component.sass'],
  imports: [AsyncPipe, DatePipe, FormsModule, IonicModule, VoiceMemoFieldComponent],
})
export class BareSlotCellComponent implements OnChanges {

  @Input() parentItem$!: OdmItem$2<any, any, any, any>
  @Input() targetNodeId!: string
  @Input() descriptorId!: string

  children$?: Observable<OdmItem$2<any, any, any, any>[]>

  /** GH #89's "descendantsCount"/"whenDescendantLastModified" rollup, scoped to just this bare
   * slot's own children (not the whole parent item's full descendant tree - see
   * `OdmItem$2.getDescendantsCount()`'s doc comment for why these are computed on demand, not
   * persisted fields). Deduplication isn't needed here the way it is for the whole-item rollup -
   * `getBareSlotChildren$()` already yields each item at most once. */
  summary$?: Observable<{count: number, whenLastModified: Date | null}>

  newChildTitle = ''

  ngOnChanges(): void {
    this.children$ = getBareSlotChildren$(this.parentItem$, this.targetNodeId)
    this.summary$ = this.children$.pipe(
      map(children => {
        const timestamps = children
          .map(child => odmTimestampToMillis((child.val as any)?.whenLastModified))
          .filter((ms): ms is number => ms !== undefined)
        return {
          count: children.length,
          whenLastModified: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null,
        }
      }),
    )
  }

  getChildTitle(child: OdmItem$2<any, any, any, any>): string {
    return (child.val as any)?.title ?? (child.val as any)?.name ?? child.id as string
  }

  addChild(): void {
    const title = this.newChildTitle.trim()
    if (!title) {
      return
    }
    createChildUnderSlot(this.parentItem$, this.targetNodeId, {title} as any)
    this.newChildTitle = ''
  }

  /** Same "voice note -> new sub-node" behavior as `MinMidMaxCellComponent`/
   * `RichTextEditCellComponent` (GH #89) - a bare slot already groups real children by this
   * exact mechanism, so recording directly onto it is just `createChildUnderSlot()` again. */
  onTranscriptReady(transcript: string): void {
    createChildUnderSlot(this.parentItem$, this.targetNodeId, {title: transcript} as any)
  }

}
