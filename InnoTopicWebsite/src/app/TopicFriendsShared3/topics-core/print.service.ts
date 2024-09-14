import { Injectable } from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from "@angular/router";
import {filter} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  static isPrint = false // !! JSON.parse(window.localStorage.getItem('isPrint') ?? 'false') // true // hack for now
  static url = undefined
  static page = undefined

  static printPages = ['/print', '/shirt'];

  constructor(
    private router: Router,
    activatedRoute: ActivatedRoute
  ) {
    console.log('PrintService ctor', activatedRoute)
    this.router.events.pipe(
      filter((event) => event instanceof NavigationStart)
    ).subscribe((event: any) => {
      console.log('PrintService event', event)
      const url = event.url;
      const printPages = PrintService.printPages;
      if (
        this.isPrintUrl(url)
      ) {
        console.log(`PrintService event.url.includes(${printPages.join(',')})`)
        PrintService.url = url
        PrintService.page = url.replace('/', '')
        PrintService.isPrint = true
      }
      // this.currentRouteSubject.next(event.urlAfterRedirects);
    });
  }

  private isPrintUrl(url: string) {
    return PrintService.printPages.some(
      path => url.includes(path)
    );
  }
}
