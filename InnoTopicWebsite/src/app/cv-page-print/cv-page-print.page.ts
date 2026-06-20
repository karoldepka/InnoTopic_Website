import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {PrintService} from "../TopicFriendsShared3/topics-core/print.service";
import {CvPageModule1} from "../cv-page/cv-page.module";
import {ShirtPageModule} from "../shirt/shirt.module";

@Component({
  standalone: true,
  selector: 'app-cv-page-print',
  templateUrl: './cv-page-print.page.html',
  styleUrls: ['./cv-page-print.page.scss'],
  imports: [
    CommonModule,
    CvPageModule1,
    ShirtPageModule,
  ],
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
