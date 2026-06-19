import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {JournalTextDescriptor, JournalTextDescriptors} from '../../models/JournalTextDescriptors'
import {JournalEntry} from '../../models/JournalEntry'
import {JournalEntry$} from '../../models/JournalEntry$'

@Component({
  standalone: false,
  selector: 'app-journal-text-fields',
  templateUrl: './journal-text-fields.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./journal-text-fields.component.sass'],
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
