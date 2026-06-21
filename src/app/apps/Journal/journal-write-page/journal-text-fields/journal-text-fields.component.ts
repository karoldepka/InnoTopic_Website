import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {JournalTextDescriptor, JournalTextDescriptors} from '../../models/JournalTextDescriptors'
import {JournalEntry} from '../../models/JournalEntry'
import {JournalEntry$} from '../../models/JournalEntry$'
import { NgFor, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { JournalTextFieldComponent } from './journal-text-field/journal-text-field.component';

@Component({
    selector: 'app-journal-text-fields',
    templateUrl: './journal-text-fields.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./journal-text-fields.component.sass'],
    imports: [
        NgFor,
        NgIf,
        IonicModule,
        JournalTextFieldComponent,
    ],
})
export class JournalTextFieldsComponent implements OnInit {

  @Input() journalEntry$ ! : JournalEntry$

  textDescriptors = JournalTextDescriptors.instance.array

  constructor() { }

  ngOnInit() {}

  // /** TODO: user reactive forms with ODM wrapper for listening to diffs */
  // onChangeText($event: Event, textDesc: JournalTextDescriptor) {
  //   const value = ($event.srcElement as any) ?. ['value'];
  //   // debugLog('onChangeText', value, $event)
  //   const patch: any = {};
  //   patch[textDesc.id !] = value as unknown as string
  //   this.journalEntry$.patchThrottled(patch)
  // }

}
