import {Component, Injector, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {FormControl, UntypedFormControl} from '@angular/forms'
import {IonicModule} from '@ionic/angular'
import {RichTextEditComponent} from '../../../rich-text/rich-text-edit/rich-text-edit.component'
import {VoiceMemoFieldComponent} from '../../../audio/voice-memo-field/voice-memo-field.component'
import {AbstractCellComponent} from '../../../AbstractCellComponent'
import {fieldVirtualNodeId} from '../SlotDescriptor'
import {createChildUnderSlot} from '../../BareSlotChildren'

/** The one rich-text cell for all of LifeSuite (GH #89) - Journal/Learn's unified slots render
 * this for any `kind: 'text'` `SlotDescriptor`. OrYoL's tree still has its own parallel
 * `OryRichTextCellComponent` wrapping the exact same underlying `RichTextEditComponent`/TinyMCE,
 * because OrYoL's node rendering sits on the legacy `OryItem$`/`ColumnCell` adapter rather than
 * `OdmCell`/`OdmTreeNode` this cell is built on - genuinely collapsing the two requires migrating
 * OrYoL's node-content rendering onto `OdmCell` first (tracked as follow-up work alongside
 * replacing OrYoL's template-node mechanism with bare slots), not a safe change to make as a
 * side-effect here. This component is kept at parity with `OryRichTextCellComponent`'s feature
 * set (TinyMCE, voice-memo transcript insertion, Enter-key interception) so that migration is a
 * delete-and-rewire later, not a redesign. */
@Component({
    selector: 'app-rich-text-edit-cell',
    templateUrl: './rich-text-edit-cell.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./rich-text-edit-cell.component.sass'],
    imports: [RichTextEditComponent, VoiceMemoFieldComponent, IonicModule],
})
export class RichTextEditCellComponent extends AbstractCellComponent {

  @ViewChild(RichTextEditComponent, {static: true})
  richTextEditComponent !: RichTextEditComponent

  /** Matches the hardcoded behavior this cell always had before this became configurable - a
   * plain Enter is suppressed and forwarded via `enterKeydownIntercepted` instead of inserting a
   * newline, since a slot cell usually sits inside a list where Enter means "next row"/"add
   * sibling", not "new paragraph". */
  @Input() enterKeyOnlyWithShift = true

  /** Forwards `RichTextEditComponent`'s own output of the same name unchanged - the caller (e.g.
   * OrYoL's tree, once migrated onto this shared cell - see class doc comment) decides what a
   * plain Enter should actually do; this cell stays app-agnostic. */
  @Output() enterKeydownIntercepted = new EventEmitter<KeyboardEvent>()

  /** Opt-in "✨ Fill with AI" affordance (`SlotDescriptor.aiFillable`) - Learn's `answer` side is
   * the first user. This cell only renders the button and emits `aiFillRequested`; the actual
   * generation call, loading state, and where the result gets written all stay with whoever set
   * `aiFillable` (e.g. `LearnItemDetailsPage`), same as `VoiceMemoFieldComponent.transcriptReady`
   * is handled by the caller rather than baked into a specific cell. */
  @Input() showAiFillButton = false
  @Input() aiFillLoading = false
  @Output() aiFillRequested = new EventEmitter<void>()

  formControl!: FormControl

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  override ngOnInit() {
    super.ngOnInit() // registers this cell with CellNavigationService

    this.formControl = new UntypedFormControl()
    this.formControl.setValue(this.cell.patchableObservable.locallyVisibleChanges$.lastVal)
    this.formControl.valueChanges.subscribe(val => {
      this.cell.patchThrottled(val)
    })

    // locallyVisibleChanges$ re-emits on every change to the item, including this cell's own
    // edit just above (an echo) and genuinely external ones (another device, a delayed
    // realtime/sync update). While hasUnsyncedChanges is true there's an edit here (or
    // elsewhere on the item) that hasn't been confirmed written yet - applying an incoming
    // value in that window would either be a pointless echo or risk overwriting/interrupting
    // what the user just typed with a delayed, possibly-stale notification. Once clear, only
    // apply a value that's actually different, and never re-emit valueChanges for it - an
    // external sync updating the field must not be turned into a new local edit.
    this.cell.patchableObservable.locallyVisibleChanges$.subscribe(val => {
      if (this.cell.hasUnsyncedChanges) {
        return
      }
      if (val !== this.formControl.value) {
        this.formControl.setValue(val, {emitEvent: false})
      }
    })
  }

  onInputChanged(event: any, newValue: any) {
    console.log('onInputChanged', newValue)
    this.cell.patchThrottled(newValue, event)
  }

  getInputValue(): string {
    return this.formControl.value ?? ''
  }

  override focus() {
    this.richTextEditComponent.focusEditor()
  }

  setInputValue(newValue: string): void {
    this.formControl.setValue(newValue, {emitEvent: false})
  }

  /** "Recording a voice note on 'mood' should create a new sub-node. Its text should be the
   * transcript." (GH #89) - a real child of this cell's item, anchored under this field's
   * fabricated virtual-node id via `manualAncestorIds` (see `BareSlotChildren.ts`), not spliced
   * into this field's own rich-text value (unlike OrYoL's `OryRichTextCellComponent`, which still
   * inserts inline - not yet migrated onto this shared cell, see class doc comment). */
  onTranscriptReady(transcript: string) {
    const targetNodeId = fieldVirtualNodeId(this.cell.treeNode.item$.id as string, this.cell.column.id)
    createChildUnderSlot(this.cell.treeNode.item$, targetNodeId, {title: transcript} as any)
  }

  /** Only Journal's 'general' field inherits the one pre-existing legacy single-recording (from
   * before per-field voice memos existed) - matches the old `JournalTextFieldComponent`'s
   * identical `fieldDescriptor.id === 'general'` check (see `VoiceMemoService.getLegacyMemoRef`'s
   * doc comment for why this must stay scoped to exactly one field). */
  get includeLegacyRecording(): boolean {
    return this.cell.column.id === 'general'
  }

}
