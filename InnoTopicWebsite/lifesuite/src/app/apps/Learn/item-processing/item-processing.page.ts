import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {ItemProcessingService} from '../core/item-processing.service'
import {importanceDescriptorsArray, importanceDescriptorsArrayFromHighestNumeric} from '../models/fields/importance.model'
import { IonicModule } from '@ionic/angular';
import { ProcessButtonComponent } from '../shared/process-button/process-button.component';
import { NgIf, NgFor, AsyncPipe, JsonPipe } from '@angular/common';

@Component({
    selector: 'app-item-processing',
    templateUrl: './item-processing.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./item-processing.page.sass'],
    imports: [
        IonicModule,
        ProcessButtonComponent,
        NgIf,
        NgFor,
        AsyncPipe,
        JsonPipe,
    ],
})
export class ItemProcessingPage implements OnInit {

  // importanceDescriptorsArray = importanceDescriptorsArray
  importanceDescriptorsArray = importanceDescriptorsArrayFromHighestNumeric

  countsByImportance = this.itemProcessingService.getCountsByImportance()

  constructor(
    public itemProcessingService: ItemProcessingService,
  ) {
  }

  ngOnInit() {
  }

}
