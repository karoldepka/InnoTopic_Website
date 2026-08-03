import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {IonicModule} from '@ionic/angular'
import {SlotDescriptor, SlotKind} from '../SlotDescriptor'

/** Renders a `SlotDescriptor`'s icon - shared/separate rather than inlined per call site (same
 * reasoning as `ExpandToggleComponent`), so a fallback-icon rule change doesn't need touching
 * every template that renders a slot. Falls back to a per-`kind` default when the descriptor
 * doesn't specify its own `icon`, mirroring OrYoL's older per-node-class icon fallback
 * (`OrYoL/tree-shared/node-content/node-class-icon/node-class-icon.component.ts`) without being
 * coupled to that component's `OryBaseTreeNode` input - this one only needs a `SlotDescriptor`,
 * so it works for a real scalar field, a bare slot, or (once ported) an OrYoL node alike. */
const DEFAULT_ICON_BY_KIND: Record<SlotKind, string> = {
  numeric: 'star-outline',
  text: 'document-text-outline',
  slot: 'folder-outline',
  intensity: 'speedometer-outline',
}

@Component({
  selector: 'app-slot-icon',
  templateUrl: './slot-icon.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./slot-icon.component.sass'],
  imports: [IonicModule],
})
export class SlotIconComponent {

  @Input() descriptor!: SlotDescriptor

  get iconName(): string {
    return this.descriptor.icon ?? DEFAULT_ICON_BY_KIND[this.descriptor.kind]
  }

}
