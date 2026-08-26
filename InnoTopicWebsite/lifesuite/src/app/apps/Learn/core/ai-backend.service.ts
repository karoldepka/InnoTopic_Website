import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIResponse {
  answer: string;
  modelName?: string;
  searchResults?: string[];
  /** GH #138: true when the model/proxy stopped before finishing (AI SDK `finishReason ===
   * 'length'`) - the saved answer is real but incomplete, e.g. cut off mid code-block. */
  truncated?: boolean;
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

/** GH #130: a user-picked local directory read entirely in the browser (see
 * `apps/Ai/shared/directory-reader.util.ts`) - `content` is only present for files that were
 * actually read (text/code extensions, under the reader's size caps). */
export interface FileTreeEntry {
  path: string;
  isDirectory: boolean;
  content?: string;
}

export interface FileTreeRequest {
  rootName: string;
  entries: FileTreeEntry[];
}

export interface CategoryTreeRequest {
  message: string;
  tree: CategoryNode[];
  web_search?: boolean;
  match_existing?: boolean;
  fileTree?: FileTreeRequest;
  /** True for chat-based refinement of the existing tree (rename/merge/split/etc.) rather than
   * generating a new tree for `message` as a topic - see the backend's identical field for why
   * this is an explicit flag rather than inferred from message text. */
  isRefinement?: boolean;
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
  /** A `data:` URI for an AI-generated illustration, populated on-demand (per-card "Generate
   * image" button, never generated automatically in bulk) rather than returned alongside the
   * question/answer themselves - see AiQaGeneratorService.generateQuestionImage(). */
  imageDataUrl?: string;
}

export interface QuestionImageRequest {
  question: string;
  answer?: string;
}

export interface QuestionImageResponse {
  imageDataUrl: string;
}

export interface QuestionAnswerRequest {
  tree: CategoryNode[];
  web_search?: boolean;
  /** Generate multiple-choice answers with four options labelled A-D. */
  abcd_answers?: boolean;
  existingQuestions?: string[];
  fileTree?: FileTreeRequest;
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

  generateQuestionImage(request: QuestionImageRequest): Observable<QuestionImageResponse> {
    return this.http.post<QuestionImageResponse>(this.apiUrl('/category-tree/questions/image'), request);
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

  // ─── ABCD Questions Database Storage ──────────────────────────────────

  /** Save ABCD format questions to the database. Questions should have the BowQuizQuestion format. */
  saveAbcdQuestions(request: { 
    questions: Array<{ 
      categoryId: string; 
      categoryPath: string; 
      question: string; 
      answers: Array<{ id: string; label: string; text: string; correct: boolean }>;
    }>;
    owner?: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl('/abcd-questions/save'), request);
  }

  /** Fetch ABCD questions from the database. Optionally filter by categoryId or owner. */
  fetchAbcdQuestions(filters?: { categoryId?: string; owner?: string; limit?: number }): Observable<any> {
    let params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.owner) params.append('owner', filters.owner);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${this.apiUrl('/abcd-questions/fetch')}?${queryString}` : this.apiUrl('/abcd-questions/fetch');
    return this.http.get<any>(url);
  }
}
