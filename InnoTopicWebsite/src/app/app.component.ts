import { Component, OnDestroy, OnInit, Type } from '@angular/core';
import { Subscription } from 'rxjs';
import {PrintService} from "./TopicFriendsShared3/topics-core/print.service";
import { CvPagePrintPage } from './cv-page-print/cv-page-print.page';
@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  // Initialize from the browser URL before Angular's first render. Router
  // NavigationStart catches client-side navigation, but fires too late to keep
  // the Ionic shell out of the initial /print DOM.
  isPrint = typeof window !== 'undefined'
    && PrintService.printPages.some(path => window.location.pathname.startsWith(path));
  printPageComponent: Type<unknown> = CvPagePrintPage;
  private printModeSubscription?: Subscription;

  constructor(
    private printService: PrintService,
  ) {}

  ngOnInit() {
    this.printModeSubscription = this.printService.isPrint$.subscribe(isPrint => {
      this.isPrint = isPrint;
      console.log('[AppComponent] isPrint:', isPrint, 'URL:', window.location.href);
    });
  }

  ngOnDestroy() {
    this.printModeSubscription?.unsubscribe();
  }
}
