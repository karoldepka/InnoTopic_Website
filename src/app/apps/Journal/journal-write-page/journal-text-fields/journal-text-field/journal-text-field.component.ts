import {Component, Input, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {JournalTextDescriptor, TextDescriptorsFormControlsDict} from '../../../models/JournalTextDescriptors'
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms'
import {ViewSyncer} from '../../../../../libs/AppFedShared/odm/ui/ViewSyncer'
import {JournalEntry} from '../../../models/JournalEntry'
import {JournalEntry$} from '../../../models/JournalEntry$'
import { RichTextEditComponent } from '../../../../../libs/AppFedShared/rich-text/rich-text-edit/rich-text-edit.component';
import { VoiceMemoFieldComponent } from '../../../../../libs/AppFedShared/audio/voice-memo-field/voice-memo-field.component';

@Component({
    selector: 'app-journal-text-field',
    templateUrl: './journal-text-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./journal-text-field.component.sass'],
    imports: [RichTextEditComponent, VoiceMemoFieldComponent],
})
export class JournalTextFieldComponent implements OnInit {

  @Input() item$ ! : JournalEntry$

  @Input() fieldDescriptor ! : JournalTextDescriptor

  formControls ! : TextDescriptorsFormControlsDict

  formGroup ! : UntypedFormGroup

  @ViewChild(RichTextEditComponent)
  richTextEditComponent ! : RichTextEditComponent

  constructor() { }

  get formControl() {
    return this.formControls[this.fieldDescriptor.id ! as keyof TextDescriptorsFormControlsDict]
  }

  /** TODO     *ngIf="viewSyncer.initialDataArrived else notLoaded" */
  viewSyncer ! : ViewSyncer


  ngOnInit() {
    this.formControls = this.createFormControlDict()
    this.formGroup = new UntypedFormGroup(this.formControls)
    this.viewSyncer = new ViewSyncer(this.formGroup, this.item$, true,
      this.fieldDescriptor.id as keyof JournalEntry) /* TODO might need to ignore other fields from db */
  }

  /** The old page-level mic used to append every transcript into the 'general' field specifically
   * (see JournalWritePage's now-removed onTranscriptReady) - only that field inherits the
   * pre-existing single legacy recording via `includeLegacy` below for the same reason. */
  get includeLegacyRecording(): boolean {
    return this.fieldDescriptor.id === 'general'
  }

  onTranscriptReady(transcript: string) {
    this.richTextEditComponent.insertTranscript(transcript)
  }

  /** Pushes this field's current (possibly still-throttled, not-yet-saved) value through
   * immediately - see ViewSyncer.flush()'s doc comment for why this matters. */
  flush() {
    this.viewSyncer.flush()
  }

  private createFormControlDict(): TextDescriptorsFormControlsDict {
    const ret = {} as TextDescriptorsFormControlsDict
    ret[this.fieldDescriptor. id ! as keyof TextDescriptorsFormControlsDict] = new UntypedFormControl()
    // console.dir(ret)
    return ret
  }

}
