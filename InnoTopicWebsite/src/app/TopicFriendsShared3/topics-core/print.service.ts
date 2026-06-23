import { Injectable } from '@angular/core';
import {NavigationStart, Router} from "@angular/router";
import {BehaviorSubject, filter} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  static isPrint = false // !! JSON.parse(window.localStorage.getItem('isPrint') ?? 'false') // true // hack for now
  static url?: string
  static page?: string

  static readonly printPages = ['/print', '/shirt'];

  private readonly isPrintSubject = new BehaviorSubject(PrintService.isPrint);
  readonly isPrint$ = this.isPrintSubject.asObservable();

  constructor(
    private router: Router,
  ) {
    this.updatePrintMode(this.router.url);
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

    if (this.isPrintSubject.value !== isPrint) {
      this.isPrintSubject.next(isPrint);
    }
  }

  private isPrintUrl(url: string) {
    return PrintService.printPages.some(
      path => url.startsWith(path)
    );
  }
}
