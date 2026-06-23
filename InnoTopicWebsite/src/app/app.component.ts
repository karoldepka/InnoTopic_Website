import { Component, OnDestroy, OnInit, Type } from '@angular/core';
import { Subscription } from 'rxjs';
import {PrintService} from "./TopicFriendsShared3/topics-core/print.service";
@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  isPrint = false;
  printPageComponent?: Type<unknown>;
  private isLoadingPrintPageComponent = false;
  private printModeSubscription?: Subscription;

  constructor(
    private printService: PrintService,
  ) {}

  ngOnInit() {
    this.printModeSubscription = this.printService.isPrint$.subscribe(isPrint => {
      this.isPrint = isPrint;
      if (isPrint) {
        void this.loadPrintPageComponent();
      }
    });
  }

  ngOnDestroy() {
    this.printModeSubscription?.unsubscribe();
  }

  private async loadPrintPageComponent() {
    if (this.isLoadingPrintPageComponent) {
      return;
    }

    this.isLoadingPrintPageComponent = true;
    this.printPageComponent = (await import('./cv-page-print/cv-page-print.page')).CvPagePrintPage;
  }
}
