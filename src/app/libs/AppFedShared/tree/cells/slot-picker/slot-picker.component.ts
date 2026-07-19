import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy} from '@angular/core'
import {IonicModule} from '@ionic/angular'
import {Subscription} from 'rxjs'
import Fuse from 'fuse.js'
import {OdmTreeNode} from '../../tree-node/OdmTreeNode'
import {isSlotVisible, SlotDescriptor} from '../SlotDescriptor'
import {SlotIconComponent} from '../slot-icon/slot-icon.component'

/** "Below the visual row with given items text, there should be a searchable horizontally-
 * flowing list of available fields" (GH #89) - a wrapping chip row of the item class's *hidden*
 * slots (already-visible ones are dropped via the same `isSlotVisible()` `TreeNodeCellsComponent`
 * uses, so picking a chip never duplicates a cell already on screen), fuzzy-searchable the same
 * way `journal-entries-list.page.ts` already searches entries (same `Fuse` threshold/config).
 * Picking a chip appends its id to `manuallyAddedSlotIds` - the one new persisted field this
 * whole design needs - which `TreeNodeCellsComponent` is already subscribed to react to. */
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

  searchTerm = ''
  visibleChips: SlotDescriptor[] = []

  private hiddenDescriptors: SlotDescriptor[] = []
  private valSubscription?: Subscription

  ngOnChanges(): void {
    this.valSubscription?.unsubscribe()
    this.valSubscription = this.treeNode.item$.val$.subscribe(() => {
      this.recomputeHidden()
      this.recomputeChips()
    })
  }

  ngOnDestroy(): void {
    this.valSubscription?.unsubscribe()
  }

  private recomputeHidden(): void {
    const itemVal = this.treeNode.item$.val
    this.hiddenDescriptors = this.descriptors.filter(descriptor => !isSlotVisible(descriptor, itemVal))
  }

  onSearchChange(term: string): void {
    this.searchTerm = term
    this.recomputeChips()
  }

  private recomputeChips(): void {
    const trimmed = this.searchTerm.trim()
    if (!trimmed) {
      this.visibleChips = this.hiddenDescriptors
      return
    }
    const fuse = new Fuse(this.hiddenDescriptors, {
      keys: ['id', 'label', 'searchTerms'],
      threshold: 0.4,
      ignoreLocation: true,
    })
    this.visibleChips = fuse.search(trimmed).map(result => result.item)
  }

  pickSlot(descriptor: SlotDescriptor): void {
    const existing = this.treeNode.item$.val?.manuallyAddedSlotIds ?? []
    if (existing.includes(descriptor.id)) {
      return
    }
    this.treeNode.item$.patchNow({manuallyAddedSlotIds: [...existing, descriptor.id]} as any)
  }

}
