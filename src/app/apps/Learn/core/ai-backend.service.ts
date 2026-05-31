import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiBackendService {
  private baseUrl = environment.aiBackendUrl ? `${environment.aiBackendUrl}/ai-api` : '/ai-api';

  constructor(private http: HttpClient) { }

  generateAnswer(question: string, context: string = ''): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.baseUrl}/generate-answer`, {
      question,
      context
    });
  }
}
