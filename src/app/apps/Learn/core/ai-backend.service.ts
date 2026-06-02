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

  generateAnswerStream(
    question: string,
    context: string = '',
  ): Observable<string> {
    return new Observable<string>(subscriber => {
      const abortController = new AbortController()

      ;(async () => {
        const response = await fetch(`${this.baseUrl}/generate-answer-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({question, context}),
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        if (!response.body) {
          throw new Error('AI backend did not return a readable stream')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let answer = ''

        while (true) {
          const {done, value} = await reader.read()
          if (done) {
            break
          }
          answer += decoder.decode(value, {stream: true})
          subscriber.next(answer)
        }

        const finalChunk = decoder.decode()
        if (finalChunk) {
          answer += finalChunk
          subscriber.next(answer)
        }
        subscriber.complete()
      })().catch(error => {
        if (!abortController.signal.aborted) {
          subscriber.error(error)
        }
      })

      return () => abortController.abort()
    })
  }
}
