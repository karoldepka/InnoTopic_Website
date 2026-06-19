import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {ItemProcessingService} from '../core/item-processing.service'
import {importanceDescriptorsArray, importanceDescriptorsArrayFromHighestNumeric} from '../models/fields/importance.model'

@Component({
  standalone: false,
  selector: 'app-item-processing',
  templateUrl: './item-processing.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./item-processing.page.sass'],
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
