import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core'
import {IonicModule} from '@ionic/angular'
import {Subscription} from 'rxjs'
import Fuse from 'fuse.js'
import {OdmTreeNode} from '../../tree-node/OdmTreeNode'
import {isSlotVisible, SlotDescriptor} from '../SlotDescriptor'
import {SlotIconComponent} from '../slot-icon/slot-icon.component'

/** "Below the visual row with given items text, there should be a searchable horizontally-
 * flowing list of available fields" (GH #89) - a wrapping chip row, fuzzy-searchable the same way
 * `journal-entries-list.page.ts` already searches entries (same `Fuse` threshold/config).
 *
 * At rest (no search typed) only shows the item class's *hidden* slots as a browsable "add a
 * field" list - already-visible ones are dropped (via the same `isSlotVisible()`
 * `TreeNodeCellsComponent` uses), so this doesn't turn into an overwhelming wall of all 236 of
 * Journal's descriptors. Once actively searching, though, the search scope widens to *every*
 * descriptor, hidden or already-visible - with everything now defaulting to a compact pill until
 * set (see `TreeNodeCellsComponent.isCompact()`), typing a field's name is the fast way to jump
 * straight to it wherever it already is, not just to add ones that aren't there yet.
 *
 * Picking a still-hidden chip appends its id to `manuallyAddedSlotIds` - the one new persisted
 * field this whole design needs - which `TreeNodeCellsComponent` is already subscribed to react
 * to. Picking an already-visible chip is a no-op here (nothing to persist) - either way,
 * `fieldPicked` fires so the parent can expand/scroll to the cell regardless of which case it was. */
@Component({
  selector: 'app-slot-picker',
  templateUrl: './slot-picker.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./slot-picker.component.sass'],
  imports: [IonicModule, SlotIconComponent],
})
export class SlotPickerComponent implements OnChanges, OnDestroy {

  @Input() treeNode!: OdmTreeNode
  @Input() descriptors!: SlotDescriptor[]

  /** Fired whenever a chip is picked, hidden or already-visible - the parent (`TreeNodeCellsComponent`)
   * uses this to expand a compact cell and scroll it into view. */
  @Output() fieldPicked = new EventEmitter<SlotDescriptor>()

  searchTerm = ''
  visibleChips: SlotDescriptor[] = []

  private addableDescriptors: SlotDescriptor[] = []
  private valSubscription?: Subscription

  ngOnChanges(): void {
    this.valSubscription?.unsubscribe()
    this.valSubscription = this.treeNode.item$.val$.subscribe(() => {
      this.recomputeAddable()
      this.recomputeChips()
    })
  }

  ngOnDestroy(): void {
    this.valSubscription?.unsubscribe()
  }

  private recomputeAddable(): void {
    const itemVal = this.treeNode.item$.val
    this.addableDescriptors = this.descriptors.filter(descriptor => !isSlotVisible(descriptor, itemVal))
  }

  onSearchChange(term: string): void {
    this.searchTerm = term
    this.recomputeChips()
  }

  private recomputeChips(): void {
    const trimmed = this.searchTerm.trim()
    if (!trimmed) {
      this.visibleChips = this.addableDescriptors
      return
    }
    // Search everything once the user is actively typing - not just what's still addable, see
    // this class's doc comment.
    const fuse = new Fuse(this.descriptors, {
      keys: ['id', 'label', 'searchTerms'],
      threshold: 0.4,
      ignoreLocation: true,
    })
    this.visibleChips = fuse.search(trimmed).map(result => result.item)
  }

  /** Purely cosmetic (see `.slot-picker__chip--visible` in the .sass) - lets a search result that's
   * already on screen (e.g. a shortlisted field, possibly still compact) look distinct from one
   * that would actually get added by picking it. */
  isAlreadyVisible(descriptor: SlotDescriptor): boolean {
    return isSlotVisible(descriptor, this.treeNode.item$.val)
  }

  pickSlot(descriptor: SlotDescriptor): void {
    const existing = this.treeNode.item$.val?.manuallyAddedSlotIds ?? []
    if (!existing.includes(descriptor.id)) {
      this.treeNode.item$.patchNow({manuallyAddedSlotIds: [...existing, descriptor.id]} as any)
    }
    this.fieldPicked.emit(descriptor)
  }

}
