import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIResponse {
  answer: string;
  modelName?: string;
  searchResults?: string[];
}

export interface ExistingCategory {
  id: string;
  title: string;
  path?: string | null;
  aliases?: string[];
}

export interface CategoryNode {
  id: string;
  title: string;
  questionCount: number;
  children: CategoryNode[];
  matchedExistingCategoryId?: string | null;
  matchedExistingCategoryTitle?: string | null;
  isExistingCategory?: boolean;
  createdAt?: number;
  draftedAt?: number;
  draftedByAIAt?: number;
  contentModifiedAt?: number;
}

export interface CategoryTreeRequest {
  message: string;
  tree: CategoryNode[];
  web_search?: boolean;
  match_existing?: boolean;
}

export interface CategoryTreeResponse {
  tree: CategoryNode[];
  assistantMessage?: string;
  modelName?: string;
  searchResults?: string[];
}

export interface QuestionAnswer {
  categoryId: string;
  categoryPath: string;
  question: string;
  answer: string;
  createdAt?: number;
  draftedAt?: number;
  draftedByAIAt?: number;
  approvedAt?: number;
  lastModifiedAt?: number;
  contentModifiedAt?: number;
}

export interface QuestionAnswerRequest {
  tree: CategoryNode[];
  web_search?: boolean;
  existingQuestions?: string[];
}

export interface QuestionAnswerResponse {
  items: QuestionAnswer[];
  modelName?: string;
  searchResults?: string[];
}

export interface ExistingCategoriesResponse {
  categories: ExistingCategory[];
}

@Injectable({
  providedIn: 'root'
})
export class AiBackendService {
  private baseUrl = environment.aiBackendUrl ? `${environment.aiBackendUrl}/ai-api` : '/ai-api';

  constructor(private http: HttpClient) { }

  apiUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  getExistingCategories(): Observable<ExistingCategoriesResponse> {
    return this.http.get<ExistingCategoriesResponse>(this.apiUrl('/categories/existing'));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.apiUrl(path), body);
  }

  generateCategoryTree(request: CategoryTreeRequest): Observable<CategoryTreeResponse> {
    return this.http.post<CategoryTreeResponse>(this.apiUrl('/category-tree'), request);
  }

  generateQuestionAnswers(request: QuestionAnswerRequest): Observable<QuestionAnswerResponse> {
    return this.http.post<QuestionAnswerResponse>(this.apiUrl('/category-tree/questions'), request);
  }

  generateAnswer(question: string, context: string = ''): Observable<AIResponse> {
    return this.http.post<AIResponse>(this.apiUrl('/generate-answer'), {
      question,
      context
    });
  }

  generateAnswerWithWebSearch(question: string, context: string = ''): Observable<AIResponse> {
    return this.http.post<AIResponse>(this.apiUrl('/generate-answer'), {
      question,
      context,
      web_search: true,
    });
  }

  generateAnswerStream(
    question: string,
    context: string = '',
    webSearch = false,
  ): Observable<string> {
    return new Observable<string>(subscriber => {
      const abortController = new AbortController()

      ;(async () => {
        const response = await fetch(this.apiUrl('/generate-answer-stream'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({question, context, web_search: webSearch}),
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
