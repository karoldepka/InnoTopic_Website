import { Component, DoCheck, Type } from '@angular/core';
import {PrintService} from "./TopicFriendsShared3/topics-core/print.service";
@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements DoCheck {

  printPageComponent?: Type<unknown>;
  private isLoadingPrintPageComponent = false;

  get isPrint() {
    return PrintService.isPrint
  }

  ngDoCheck() {
    if (this.isPrint && !this.printPageComponent) {
      void this.loadPrintPageComponent();
    }
  }

  private async loadPrintPageComponent() {
    if (this.isLoadingPrintPageComponent) {
      return;
    }

    this.isLoadingPrintPageComponent = true;
    this.printPageComponent = (await import('./cv-page-print/cv-page-print.page')).CvPagePrintPage;
  }

  constructor(
    printService: PrintService,
  ) {}
}
