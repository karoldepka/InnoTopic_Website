import { Component, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from "@angular/forms";
import { IonicModule } from '@ionic/angular';
import { Meeting } from "../meetings-models/Meeting";
import { DescriptionEditorComponent } from './description-editor/description-editor.component';

@Component({
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, JsonPipe, DescriptionEditorComponent],
  selector: 'app-meeting-details-page',
  templateUrl: './meeting-details.page.html',
  styleUrls: ['./meeting-details.page.sass'],
})
export class MeetingDetailsPage implements OnInit {

  formGroupControls = {
    title: new FormControl(),
    location: new FormControl(),
    date: new FormControl(),
    description: new FormControl(),
  };
  formGroup = new FormGroup(this.formGroupControls);

  meeting ! : Meeting // = new Meeting() // forkDraftItem()

  constructor() {
  }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe(val => {
      this.meeting.patchDraftThrottled(val)
    })
  }

  onPublish() {
    this.meeting.publishDraft()
  }
}
