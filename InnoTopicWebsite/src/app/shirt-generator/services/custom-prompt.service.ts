import {Injectable} from '@angular/core';
import {AbstractTopicsPromptService} from "../models/abstract-topics-prompt.service";
import {map, Observable, of} from 'rxjs';
import {HttpClient} from "@angular/common/http";

type CustomAIData = {
  name: string;
  svg_logo: string;
  url: string;
}

type Response<T> = {
  response: T;
}

@Injectable({
  providedIn: 'root'
})
export class CustomPromptService extends AbstractTopicsPromptService {
  // TODO: 1. implement logic to return list of svg name from the response ✅
  // TODO: 2. make a separate component that renders svg icon based on icon name from the response (create full path from public directory) ✅
  // TODO: 3. create git sub-module to have all svg icons (from repo https://github.com/gilbarbara/logos) in the public directory ✅
  // TODO: 4. optional - maybe need to create script that loads files to public directory

  constructor(
    private httpClient: HttpClient
  ) {
    super();
  }

  public override prompt(text: string): Observable<string[]> {
    return this.httpClient.post<Response<CustomAIData[]>>('/ai-api/process-prompt', {prompt: text})
      .pipe(
        map((res: Response<CustomAIData[]>) => res.response.map(data => data.svg_logo))
      );
  }
}
