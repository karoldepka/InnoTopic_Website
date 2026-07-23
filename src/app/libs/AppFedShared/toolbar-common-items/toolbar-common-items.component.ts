import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core'
import {AsyncPipe} from '@angular/common'
import {IonicModule} from '@ionic/angular'
import {NavigationEnd, Router} from '@angular/router'
import {Observable} from 'rxjs'
import {filter, map, startWith} from 'rxjs/operators'
import {AuthService} from '../../../auth/auth.service'
import {GenericItemsService} from '../tree/generic-items.service'
import {GenericItem} from '../tree/GenericItem'
import {GenericItem$} from '../tree/GenericItem$'
import {getUserTreeRootId} from '../tree/UserTreeRoot'
import {fieldVirtualNodeId} from '../tree/cells/SlotDescriptor'
import {createChildUnderSlot} from '../tree/BareSlotChildren'
import {VoiceMemoFieldComponent} from '../audio/voice-memo-field/voice-memo-field.component'
import {VoiceAttachableItem, VoiceMemoService} from '../audio/voice-memo.service'
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
  imports: [IonicModule, AsyncPipe, TimeTrackingToolbarComponent, VoiceMemoFieldComponent],
})
export class ToolbarCommonItemsComponent {

  @ViewChild(VoiceMemoFieldComponent) voiceMemoField!: VoiceMemoFieldComponent

  /** No mic buttons should show while quizzing (this toolbar's quick-record one, same as the
   * per-field ones in ItemSideComponent.showMic) - mounted once outside the router-outlet, so it
   * has to check the current route itself rather than being told via an @Input. Exposed as an
   * observable (consumed via `| async` in the template, like voiceMemoService's isRecordingAnywhere$/
   * isPlayingAnywhere$ right above it), not a plain field written from the router.events
   * subscription - a plain field caused ExpressionChangedAfterItHasBeenCheckedError, since the
   * subscription's callback can run in between Angular's own check/checkNoChanges passes for the
   * same cycle; the async pipe is built to handle exactly that. */
  inQuiz$: Observable<boolean>

  constructor(
    private authService: AuthService,
    private genericItemsService: GenericItemsService,
    // Public: template shows isRecordingAnywhere$ as a toolbar-wide indicator, regardless of
    // which field's own mic button (this toolbar's quick-record one, or any other field anywhere
    // in the app, e.g. Journal's `general`) is the one actually recording.
    public voiceMemoService: VoiceMemoService,
    router: Router,
  ) {
    this.inQuiz$ = router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects.startsWith('/learn/quiz') || e.urlAfterRedirects.startsWith('/learn/bow-quiz')),
      startWith(router.url.startsWith('/learn/quiz') || router.url.startsWith('/learn/bow-quiz')),
    )
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
