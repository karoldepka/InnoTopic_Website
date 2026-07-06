import {Component, Input, OnInit, QueryList, ViewChildren, ChangeDetectionStrategy} from '@angular/core';
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

  @ViewChildren(JournalTextFieldComponent)
  private textFieldComponents ! : QueryList<JournalTextFieldComponent>

  constructor() { }

  ngOnInit() {}

  /** Flushes every field's possibly-still-throttled pending edit immediately - see
   * ViewSyncer.flush()'s doc comment for why this matters. Called before navigating away from
   * the entry (JournalWritePage), not just relying on the field-level 1500ms throttle to catch up
   * on its own. */
  flushAll() {
    this.textFieldComponents ?. forEach(field => field.flush())
  }

  hasValue(textDesc: JournalTextDescriptor): boolean {
    const value = (this.journalEntry$.currentVal as any)?.[textDesc.id!]
    return !! (value && String(value).trim().length)
  }

  // /** TODO: user reactive forms with ODM wrapper for listening to diffs */
  // onChangeText($event: Event, textDesc: JournalTextDescriptor) {
  //   const value = ($event.srcElement as any) ?. ['value'];
  //   // debugLog('onChangeText', value, $event)
  //   const patch: any = {};
  //   patch[textDesc.id !] = value as unknown as string
  //   this.journalEntry$.patchThrottled(patch)
  // }

}
