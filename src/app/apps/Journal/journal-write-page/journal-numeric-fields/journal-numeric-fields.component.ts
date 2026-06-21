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

  get isSearchEntered() {
    return this.search ?. trim() ?. length
  }

  constructor() { }

  ngOnInit() {}

  onChangeNumericValue(numericPickerVal: NumericPickerVal, descriptor: JournalNumericDescriptor) {
    const patch: any = {}
    // TODO: figure out deep patches by path strings like in firebase (to prevent data loss)
    const fieldVal: JournalCompositeFieldVal = {
      numVal: numericPickerVal
      // later: comments, maybe lastModified etc.
    }
    patch[descriptor.id !] = fieldVal
    this.journalEntry$.patchThrottled(patch)
  }

}
