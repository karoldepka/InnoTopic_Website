import {Component, Input, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {Side, sidesDefs, SidesDefs} from '../../core/sidesDefs'
import {ViewSyncer} from '../../../../libs/AppFedShared/odm/ui/ViewSyncer'
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms'
import {nullish} from '../../../../libs/AppFedShared/utils/type-utils'
import {LearnItem$} from '../../models/LearnItem$'
import {debugLog} from '../../../../libs/AppFedShared/utils/log'
import {LearnItem} from '../../models/LearnItem'
import {RichTextEditComponent} from '../../../../libs/AppFedShared/rich-text/rich-text-edit/rich-text-edit.component'
import {OdmCell} from '../../../../libs/AppFedShared/tree/cells/OdmCell'
import {AiBackendService} from '../../core/ai-backend.service'
import {OdmBackend} from '../../../../libs/AppFedShared/odm/OdmBackend'
import {stripHtml} from '../../../../libs/AppFedShared/utils/html-utils'
import {finalize} from 'rxjs/operators'
import { NgIf, NgClass, AsyncPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SideIconComponent } from '../side-icon/side-icon.component';
import { SideLabelComponent } from '../side-label/side-label.component';
import { QuizAnswerRevealerComponent } from '../../quiz/quiz-item-details/quiz-answer-revealer/quiz-answer-revealer.component';
import { VoiceMemoFieldComponent } from '../../../../libs/AppFedShared/audio/voice-memo-field/voice-memo-field.component';

export type SideFormControlsDict = {[key in keyof SidesDefs]: UntypedFormControl }


// TODO: escape key to hide toolbar&menu bar
@Component({
    selector: 'app-item-side-editor',
    templateUrl: './item-side.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./item-side.component.sass'],
    imports: [
        NgIf,
        IonicModule,
        NgClass,
        SideIconComponent,
        SideLabelComponent,
        RichTextEditComponent,
        QuizAnswerRevealerComponent,
        AsyncPipe,
        VoiceMemoFieldComponent,
    ],
})
export class ItemSideComponent implements OnInit {

  answerDescr = sidesDefs.answer


  @Input()
  set item$(item$: LearnItem$) {
    this._item$ = item$
  }

  get item$(): LearnItem$ {
    return this._item$
  }

  private _item$ ! : LearnItem$

  /** TODO: this should use OdmCell (maybe subclass like ItemSideCell); and this expandable icon-to-editor functionality could be useful also in treetable node cell */
  @Input()
  side ! : Side | nullish

  @Input()
  cell ! : OdmCell

  @Input()
  showRevealButton = false

  /** Quiz sets this to false - no mic buttons should show while quizzing. */
  @Input()
  showMic = true

  /** Quiz sets this to false - the "Fill with AI" answer button defeats the point of being
   * quizzed, so it's only meant for the regular item-editing page. */
  @Input()
  showAiFillButton = true


  formControls ! : SideFormControlsDict

  formGroup ! : UntypedFormGroup

  editorOpened = false

  aiLoading = false

  @ViewChild(RichTextEditComponent)
  editorViewChild ! : RichTextEditComponent


  get formControl() {
    return this.formControls[this.side!.id]
  }

  /** TODO     *ngIf="viewSyncer.initialDataArrived else notLoaded" */
  viewSyncer ! : ViewSyncer


  constructor(private aiBackend: AiBackendService) { }

  ngOnInit() {
    if ( this.side ) {
      this.formControls = this.createFormControlDict()
      this.formGroup = new UntypedFormGroup(this.formControls)
      this.viewSyncer = new ViewSyncer(
        this.formGroup,
        this.item$,
        true,
        this.side !. id as keyof LearnItem
      ) /* TODO might need to ignore other fields from db */
    }
  }

  private createFormControlDict(): SideFormControlsDict {
    const ret = {} as SideFormControlsDict
    ret[this.side !. id] = new UntypedFormControl()
    // console.dir(ret)
    return ret
  }

  logEditor(msg: string) {
    debugLog(`tinymce: `, msg)
  }

  focusEditor() {
    setTimeout(() => {
      // debugLog(`focusEditor`, this.editorViewChild)
      this.editorViewChild ?. focusEditor()
    }, 10)
  }

  /** Opens the editor (if it wasn't already, e.g. dictating straight into an empty side) before
   * inserting - `editorViewChild` only exists once the *ngIf around `<app-rich-text-edit>` below
   * is satisfied, so setting `editorOpened` has to take effect (next tick) before this can reach
   * it, same as `focusEditor()` above. */
  onTranscriptReady(transcript: string) {
    this.editorOpened = true
    setTimeout(() => {
      this.editorViewChild ?. insertTranscript(transcript)
    }, 10)
  }

  isDependencySatisfied(): boolean {
    return true // for convenience if I want to cut&paste directly to a field e.g. question2
    // if ( ! this.side?.dependsOn ) {
    //   return true
    // } else {
    //   // debugLog(`isDependencySatisfied`, this.side, this.formControls[this.side.dependsOn.id]?.value?.trim(), this.formControls)
    //   return !! (this.item$?.currentVal?.[this.side.dependsOn.id as keyof LearnItem] as any as string)?.trim()
    //   // return this.formControls[this.side.dependsOn.id]?.value
    //   // return !! (this.formControls[this.side.dependsOn.id]?.value?.trim())
    // }
  }

  onChangeEditor($event: any) {
    // hack
    if ( $event?.length === 0 ) {
      debugLog(`onChangeEditor empty`, $event)
    }
  }

  isVisible(item: LearnItem | nullish): boolean {
    if ( ! item ) {
      return false
    }
    if ( this.side ?. hideByDefault ) {
      return false
    }
    if ( item.isTask && ! item.isToLearn ) {
      return ! this.side?.onlyForLearn
    }
    return true
  }

  async fillWithAI() {
    if (this.aiLoading) {
      return
    }
    const item = this.item$.currentVal
    if (!item) return

    // Use the Q&A question as the prompt input, and persist generated text to the answer side.
    const question = stripHtml(item.getQuestion?.() || item.title || '') || ''
    const context = (item.joinedSides ? stripHtml(item.joinedSides()) : '') ?? ''

    this.aiLoading = true
    this.editorOpened = true
    this.formControl.setValue('')
    this.item$.patchThrottled({answer: ''})

    this.aiBackend.generateAnswerWithWebSearch(question, context).pipe(
      finalize(() => this.aiLoading = false)
    ).subscribe(
      response => {
        const modelName = response?.modelName || 'unknown-model'
        const marker = `#FilledByAI:(${modelName})`
        const answer = `${(response?.answer || '').trim()}\n\n${marker}`.trim()
        this.formControl.setValue(answer)
        this.item$.patchThrottled({answer, whenGeneratedByAi: OdmBackend.nowTimestamp()})
      },
      e => console.error('Error filling with AI', e)
    )
  }

}
