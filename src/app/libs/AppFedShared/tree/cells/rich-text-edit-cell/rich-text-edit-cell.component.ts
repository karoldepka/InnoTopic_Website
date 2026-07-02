import {Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {OdmCell} from '../OdmCell'
import {CellNavigationService} from '../../../cell-navigation.service'
import {FormControl, UntypedFormControl} from '@angular/forms'
import {RichTextEditComponent} from '../../../rich-text/rich-text-edit/rich-text-edit.component'
import {CellComponent} from '../../../../../apps/OrYoL/tree-shared/cells/CellComponent'
import {errorAlert} from '../../../utils/log'

@Component({
    selector: 'app-rich-text-edit-cell',
    templateUrl: './rich-text-edit-cell.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./rich-text-edit-cell.component.sass'],
    imports: [RichTextEditComponent],
})
export class RichTextEditCellComponent /*extends CellComponent*/ implements OnInit {

  /** TODO use RichTextEditComponent.
   * Later the fancy component could be activated on-demand by some 3-dots menu button or edit icon
   * Pass FormControl
   * */
  @ViewChild('contentEditableEl', {static: true})
  contentEditableEl !: ElementRef

  @ViewChild(RichTextEditComponent, {static: true})
  richTextEditComponent !: RichTextEditComponent

  @Input()
  cell !: OdmCell

  formControl!: FormControl

  constructor(
    public cellNavigationService: CellNavigationService
  ) {
    // super()
  }

  /*override */ngOnInit() {
    // super.onInit()
    // this.contentEditableEl
    //   .nativeElement.addEventListener('input', (event: any) => this.onInputChanged(event, this.getInputValue()))

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

  /*override */ onInputChanged(event: any, newValue: any) {
    console.log('onInputChanged', newValue)
    this.cell.patchThrottled(newValue, event)
  }

  /*override */getInputValue(): string {
    return this.contentEditableEl.nativeElement.innerHTML
  }

  /*override */ focus() {
    this.richTextEditComponent.focusEditor()
  }

  /*override */ setInputValue(newValue: string): void {
    errorAlert('setInputValue not implemented; do i still need it?')
  }

}
