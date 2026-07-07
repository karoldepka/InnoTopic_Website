import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {JournalEntry$} from '../../../apps/Journal/models/JournalEntry$'
import {Observable} from 'rxjs'
import {LearnItem} from '../../../apps/Learn/models/LearnItem'
import {JournalEntry} from '../../../apps/Journal/models/JournalEntry'
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TimePointComponent } from '../../../libs/AppFedShared/time/time-point/time-point.component';
import { JournalNumFieldsViewComponent } from './journal-num-fields-view/journal-num-fields-view.component';
import { JournalTextFieldsViewComponent } from './journal-text-fields-view/journal-text-fields-view.component';
import { VoiceMemoFieldComponent } from '../../../libs/AppFedShared/audio/voice-memo-field/voice-memo-field.component';

@Component({
    selector: 'app-journal-entry-list-item',
    templateUrl: './journal-entry-list-item.component.html',
    styleUrls: ['./journal-entry-list-item.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        RouterLink,
        IonicModule,
        TimePointComponent,
        JournalNumFieldsViewComponent,
        JournalTextFieldsViewComponent,
        AsyncPipe,
        VoiceMemoFieldComponent,
    ],
})
export class JournalEntryListItemComponent implements OnInit {

  @Input() item$ ! : JournalEntry$

  get val$(): Observable<JournalEntry | undefined | null> | undefined {
    return this.item$ ?. val$WithWhenCreated
  }


  constructor(
  ) { }

  ngOnInit() {}

}
