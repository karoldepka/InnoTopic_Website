import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { NumericPickerVal, NumericPickerComponent } from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {JournalNumericDescriptor, JournalNumericDescriptors} from '../../models/JournalNumericDescriptors'
import {JournalCompositeFieldVal, JournalEntry} from '../../models/JournalEntry'
import {JournalEntry$} from '../../models/JournalEntry$'
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-journal-numeric-fields',
    templateUrl: './journal-numeric-fields.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./journal-numeric-fields.component.sass'],
    imports: [
        IonicModule,
        ReactiveFormsModule,
        FormsModule,
        NgIf,
        NgFor,
        NumericPickerComponent,
    ],
})
export class JournalNumericFieldsComponent implements OnInit {

  numDescriptors = JournalNumericDescriptors.instance.array

  search = ''

  @Input() journalEntry$ !: JournalEntry$

  showAny = false

  showAll = false

  openCommentFieldIds = new Set<string>()

  get isSearchEntered() {
    return this.search ?. trim() ?. length
  }

  constructor() { }

  ngOnInit() {}

  onChangeNumericValue(numericPickerVal: NumericPickerVal, descriptor: JournalNumericDescriptor) {
    const patch: any = {}
    const existing: JournalCompositeFieldVal = (this.journalEntry$.currentVal as any)?.[descriptor.id!] ?? {}
    patch[descriptor.id!] = { ...existing, numVal: numericPickerVal }
    this.journalEntry$.patchThrottled(patch)
  }

  toggleComment(descriptor: JournalNumericDescriptor) {
    const id = descriptor.id!
    if (this.openCommentFieldIds.has(id)) {
      this.openCommentFieldIds.delete(id)
    } else {
      this.openCommentFieldIds.add(id)
    }
  }

  isCommentOpen(descriptor: JournalNumericDescriptor): boolean {
    return this.openCommentFieldIds.has(descriptor.id!) || !!this.getComment(descriptor)
  }

  getComment(descriptor: JournalNumericDescriptor): string {
    return (this.journalEntry$.currentVal as any)?.[descriptor.id!]?.comment ?? ''
  }

  onChangeComment(comment: string | null | undefined, descriptor: JournalNumericDescriptor) {
    const patch: any = {}
    const existing: JournalCompositeFieldVal = (this.journalEntry$.currentVal as any)?.[descriptor.id!] ?? {}
    patch[descriptor.id!] = { ...existing, comment: comment ?? '' }
    this.journalEntry$.patchThrottled(patch)
  }

}
