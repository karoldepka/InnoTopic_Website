import {Injectable} from '@angular/core';
import {BehaviorSubject, delay, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ShirtGeneratorService {

  private generatedContent = new BehaviorSubject<string[]>([]);

  readonly generatedContent$ = this.generatedContent.asObservable();

  readonly apiUrl = 'localhost:3000';

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  generate(searchText: string): Observable<unknown> {
    return this.httpClient.get<unknown>(this.apiUrl);
  }

  generateMock(searchText: string): Observable<string[]> {
    return of(['Data 1', 'Data 2', 'Data 3', 'Data 4']).pipe(delay(400));
  }

  clearGeneratedContent() {
    this.setGeneratedContent([]);
  }

  setGeneratedContent(value: string[]) {
    this.generatedContent.next(value);
  }
}
