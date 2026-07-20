import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core'
import {IonicModule} from '@ionic/angular'
import {AuthService} from '../../../auth/auth.service'
import {GenericItemsService} from '../tree/generic-items.service'
import {GenericItem} from '../tree/GenericItem'
import {GenericItem$} from '../tree/GenericItem$'
import {getUserTreeRootId} from '../tree/UserTreeRoot'
import {fieldVirtualNodeId} from '../tree/cells/SlotDescriptor'
import {createChildUnderSlot} from '../tree/BareSlotChildren'
import {VoiceMemoFieldComponent} from '../audio/voice-memo-field/voice-memo-field.component'
import {VoiceAttachableItem} from '../audio/voice-memo.service'
import {OdmBackend} from '../odm/OdmBackend'
import {TimeTrackingToolbarComponent} from '../../../apps/OrYoL/time-tracking/time-tracking-toolbar/time-tracking-toolbar.component'

/** GH #92: the time-tracked-entry indicator and a quick-record mic, both meant to be visible
 * regardless of which page is open - mount this once in `AppComponent`'s shell
 * (`app.component.html`), not per-page.
 *
 * `TimeTrackingToolbarComponent` ("what am I tracking right now") already exists and is fully
 * generic under the hood (`DbTreeService`/`NavigationService`, nothing OrYoL-specific) - it was
 * just only ever wired into OrYoL's own tree-page toolbar, so every other page never showed it.
 * Reused here as-is.
 *
 * The mic reuses `VoiceMemoFieldComponent` as-is too - its mini-FFT (`AudioVisualizerComponent`)
 * and live recording-duration display are already its own built-in UI, nothing new needed there.
 * Each recording becomes a standalone `GenericItem` (`alwaysCreateNewItemOnRecord` - "one
 * recording = one new item", unlike Learn's quick-add bar which intentionally accumulates
 * multiple takes onto the same draft item), anchored under a `'quick_notes'` bare slot off the
 * user's cross-app tree root - the same mechanism `CategoriesComponent` already uses for its own
 * top-level categories - so nothing is truly orphaned even before "detection of item class"
 * (explicitly deferred in the issue) exists to route it anywhere smarter. */
@Component({
  selector: 'app-toolbar-common-items',
  templateUrl: './toolbar-common-items.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./toolbar-common-items.component.sass'],
  imports: [IonicModule, TimeTrackingToolbarComponent, VoiceMemoFieldComponent],
})
export class ToolbarCommonItemsComponent {

  @ViewChild(VoiceMemoFieldComponent) voiceMemoField!: VoiceMemoFieldComponent

  constructor(
    private authService: AuthService,
    private genericItemsService: GenericItemsService,
  ) {
  }

  // Every route this component is reachable from already requires auth (matches
  // CategoriesComponent's identical assumption/comment for the same well-known-root pattern).
  private get userRootItem$(): GenericItem$ {
    const userRootId = getUserTreeRootId(this.authService.userId as string)
    return this.genericItemsService.obtainItem$ById(userRootId as any)
  }

  private get quickNotesSlotId(): string {
    return fieldVirtualNodeId(getUserTreeRootId(this.authService.userId as string), 'quick_notes')
  }

  createQuickRecordItem = (): VoiceAttachableItem => {
    return createChildUnderSlot(this.userRootItem$, this.quickNotesSlotId, Object.assign(new GenericItem(), {
      whenAdded: OdmBackend.nowTimestamp(),
    }))
  }

  onQuickRecordTranscriptReady(transcript: string) {
    this.voiceMemoField.item$?.patchThrottled({title: transcript})
  }

}
