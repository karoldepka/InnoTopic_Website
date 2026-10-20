import { Injectable } from '@angular/core';
import {NavigationStart, Router} from "@angular/router";
import {BehaviorSubject, filter, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  static isPrint = false
  static url?: string
  static page?: string

  static readonly printPages = ['/print', '/shirt'];

  private readonly isPrintSubject: BehaviorSubject<boolean>;
  readonly isPrint$: Observable<boolean>;

  constructor(
    private router: Router,
  ) {
    this.updatePrintMode(this.currentBrowserUrl());
    this.isPrintSubject = new BehaviorSubject(PrintService.isPrint);
    this.isPrint$ = this.isPrintSubject.asObservable();
    this.router.events.pipe(
      filter((event): event is NavigationStart => event instanceof NavigationStart)
    ).subscribe((event) => {
      this.updatePrintMode(event.url);
    });
  }

  private updatePrintMode(url: string) {
    const isPrint = this.isPrintUrl(url);
    PrintService.isPrint = isPrint;
    PrintService.url = isPrint ? url : undefined;
    PrintService.page = isPrint ? url.replace('/', '') : undefined;

    if (this.isPrintSubject && this.isPrintSubject.value !== isPrint) {
      this.isPrintSubject.next(isPrint);
    }
  }

  private currentBrowserUrl() {
    return typeof window === 'undefined'
      ? this.router.url
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  private isPrintUrl(url: string) {
    return PrintService.printPages.some(
      path => url.startsWith(path)
    );
  }
}
