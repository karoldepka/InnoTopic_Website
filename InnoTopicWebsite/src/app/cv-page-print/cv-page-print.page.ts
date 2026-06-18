import { Component, OnInit } from '@angular/core';
import {PrintService} from "../TopicFriendsShared3/topics-core/print.service";

@Component({
  standalone: false,
  selector: 'app-cv-page-print',
  templateUrl: './cv-page-print.page.html',
  styleUrls: ['./cv-page-print.page.scss'],
})
export class CvPagePrintPage implements OnInit {

  get printPage() {
    return PrintService.page
  }

  constructor() {
    console.log('CvPagePrintPage ctor')
    // PrintService.isPrint = true
  }

  ngOnInit() {
  }

}
