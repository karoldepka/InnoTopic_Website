import {Component, ViewChild, ChangeDetectionStrategy} from '@angular/core'
import {UntypedFormControl, ReactiveFormsModule} from '@angular/forms'
import {CellComponent} from '../CellComponent'
import {RichTextEditComponent} from '../../../../../libs/AppFedShared/rich-text/rich-text-edit/rich-text-edit.component'
import {VoiceMemoFieldComponent} from '../../../../../libs/AppFedShared/audio/voice-memo-field/voice-memo-field.component'
import {NodeFocusOptions} from '../../../tree-model/TreeModel'
import {nullish} from '../../../../../libs/AppFedShared/utils/type-utils'

/** Rich-text replacement for ContenteditableCellComponent's raw `contenteditable` div, so
 * OrYoL's `/tree` node titles get the same TinyMCE-backed paste handling (image embedding,
 * autolink, the blobInfo malformed-base64 guard) every other surface already shares via
 * `app-rich-text-edit`, instead of falling back to whatever the browser's native paste does. */
@Component({
    selector: 'app-ory-rich-text-cell',
    templateUrl: './ory-rich-text-cell.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./ory-rich-text-cell.component.sass'],
    imports: [RichTextEditComponent, ReactiveFormsModule, VoiceMemoFieldComponent],
})
export class OryRichTextCellComponent extends CellComponent {

  @ViewChild(RichTextEditComponent, {static: true})
  richTextEditComponent!: RichTextEditComponent

  formControl = new UntypedFormControl('')

  onTranscriptReady(transcript: string) {
    this.richTextEditComponent.insertTranscript(transcript)
  }

  override ngOnInit() {
    super.ngOnInit()
    // Seeded directly (rather than relying solely on NodeContentViewSyncer's post-view-init
    // push) so this still shows the right content if it's mounted later than construction time -
    // e.g. switched to live via the toolbar popover's TinyMCE/contenteditable toggle, instead of
    // only ever being created up front.
    this.formControl.setValue(this.column.getValueFromItemData(this.treeNode.content.itemData), {emitEvent: false})
    this.formControl.valueChanges.subscribe(newValue => {
      this.onInputChanged(null, newValue)
    })
  }

  getInputValue(): string {
    return this.formControl.value ?? ''
  }

  setInputValue(newValue: string): void {
    this.formControl.setValue(newValue, {emitEvent: false})
  }

  focus(options?: NodeFocusOptions | nullish): void {
    this.richTextEditComponent.focusEditor()
  }

  /** TinyMCE's own Enter handling (see `[enterKeyOnlyWithShift]` above) suppresses a plain Enter
   * itself and forwards it here instead of letting it bubble - see `enterKeydownIntercepted`'s
   * doc comment on RichTextEditComponent for why passive bubbling doesn't reach
   * NodeContentComponent's own keydown handlers for this. Dispatches on the same modifiers those
   * handlers key off of, since this one forwarded event now has to stand in for all of them. */
  onEnterKeydownIntercepted(event: KeyboardEvent): void {
    if (event.altKey) {
      this.nodeContentComponent.keyPressAltEnter(event)
    } else if (event.metaKey || event.ctrlKey) {
      this.nodeContentComponent.keyPressMetaEnter(event)
    } else {
      this.nodeContentComponent.createSiblingOrChildOnEnter()
    }
  }
}
