import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap, takeUntil} from "rxjs";
import {ShirtGeneratorService} from "./services/shirt-generator.service";

@Component({
  selector: 'app-shirt-generator',
  standalone: false,
  templateUrl: './shirt-generator.page.html',
  styleUrls: ['./shirt-generator.page.scss'],
})
export class ShirtGeneratorPage implements OnInit, OnDestroy {

  searchEvent$ = new Subject<string>();
  isLoading$ = new BehaviorSubject(false);
  destroySubject = new Subject<void>();

  result$ = this.shirtGeneratorService.generatedContent$;

  constructor(
    private shirtGeneratorService: ShirtGeneratorService,
  ) {
  }

  ngOnInit() {
    this.searchEvent$.pipe(
      takeUntil(this.destroySubject),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap((text) => {
        this.isLoading$.next(true);
        return this.shirtGeneratorService.generateTopics(text).pipe(
          catchError(() => {
            this.shirtGeneratorService.clearGeneratedContent();
            return of([]);
          }),
          finalize(() => this.isLoading$.next(false)),
        );
      }),
    ).subscribe((result) => this.shirtGeneratorService.setGeneratedContent(result))
  }

  onSearch(searchText: string) {
    this.searchEvent$.next(searchText);
  }

  ngOnDestroy() {
    this.destroySubject.next();
    this.destroySubject.complete();
    this.isLoading$.complete();
  }

}
