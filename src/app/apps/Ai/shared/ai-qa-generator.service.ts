import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { StructuredObject } from '@ai-sdk/angular';
import { CopilotKit, injectAgentStore } from '@copilotkit/angular';
import { Message, randomUUID } from '@ag-ui/client';
import { z } from 'zod';
import { firstValueFrom } from 'rxjs';

import {
  AiBackendService,
  CategoryNode,
  CategoryTreeRequest,
  CategoryTreeResponse,
  ExistingCategory,
  QuestionAnswer,
  QuestionAnswerRequest,
  QuestionAnswerResponse,
} from '../../Learn/core/ai-backend.service';
import { cloneCategoryTree, countCategoryNodes } from './ai-qa-tree.utils';

export type QaIntegrationMode = 'vercel-ai-sdk' | 'copilotkit';

export const COPILOT_AGENT_ID = 'lifesuite-qa';

// ---- Zod schemas --------------------------------------------------------

const categoryNodeSchema: z.ZodType<CategoryNode> = z.lazy(() => z.object({
  id: z.string(),
  title: z.string(),
  questionCount: z.number(),
  children: z.array(categoryNodeSchema),
  matchedExistingCategoryId: z.string().nullable().optional(),
  matchedExistingCategoryTitle: z.string().nullable().optional(),
  isExistingCategory: z.boolean().optional(),
}));

export const categoryTreeResponseSchema: z.ZodType<CategoryTreeResponse> = z.object({
  tree: z.array(categoryNodeSchema),
  assistantMessage: z.string().optional(),
  modelName: z.string().optional(),
  searchResults: z.array(z.string()).optional(),
});

const questionAnswerSchema: z.ZodType<QuestionAnswer> = z.object({
  categoryId: z.string(),
  categoryPath: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const questionAnswerResponseSchema: z.ZodType<QuestionAnswerResponse> = z.object({
  items: z.array(questionAnswerSchema),
  modelName: z.string().optional(),
  searchResults: z.array(z.string()).optional(),
});

// ---- Service ------------------------------------------------------------

@Injectable()
export class AiQaGeneratorService {
  private readonly aiBackend = inject(AiBackendService);
  private readonly copilotKit = inject(CopilotKit);
  private readonly copilotStore = injectAgentStore(COPILOT_AGENT_ID);

  private readonly categoryObject = new StructuredObject<
    typeof categoryTreeResponseSchema,
    CategoryTreeResponse,
    CategoryTreeRequest
  >({
    api: this.aiBackend.apiUrl('/category-tree/stream-json'),
    schema: categoryTreeResponseSchema,
    ...({ streamProtocol: 'text' } as object),
  });

  private readonly questionObject = new StructuredObject<
    typeof questionAnswerResponseSchema,
    QuestionAnswerResponse,
    QuestionAnswerRequest
  >({
    api: this.aiBackend.apiUrl('/category-tree/questions/stream-json'),
    schema: questionAnswerResponseSchema,
    ...({ streamProtocol: 'text' } as object),
  });

  // Exposed state signals
  readonly tree = signal<CategoryNode[]>([]);
  readonly questions = signal<QuestionAnswer[]>([]);
  readonly existingCategories = signal<ExistingCategory[]>([]);
  readonly modelName = signal('');
  readonly categoryStatus = signal('Ready');
  readonly questionStatus = signal('Ready');
  readonly categoryError = signal('');
  readonly questionError = signal('');
  readonly categoryLoading = signal(false);
  readonly questionLoading = signal(false);

  readonly categoryCount = computed(() => countCategoryNodes(this.tree()));

  private categoryAbortController: AbortController | null = null;
  private questionAbortController: AbortController | null = null;

  constructor() {
    // Live-update tree from streaming partial JSON
    effect(() => {
      if (!this.categoryLoading()) return;
      const partial = this.categoryObject.object as any;
      const nodes: any[] = Array.isArray(partial?.tree) ? partial.tree : [];
      const validNodes = nodes
        .filter(n => n?.id && n?.title)
        .map(n => this.makePartialCategoryNode(n));
      if (validNodes.length > 0) {
        this.tree.set(validNodes);
        this.categoryStatus.set(`Streaming… ${validNodes.length} categories`);
      }
    });

    // Live-update questions from streaming partial JSON
    effect(() => {
      if (!this.questionLoading()) return;
      const partial = this.questionObject.object as any;
      const items: any[] = Array.isArray(partial?.items) ? partial.items : [];
      const validItems = items.filter(i => i?.question);
      if (validItems.length > 0) {
        this.questions.set(validItems as QuestionAnswer[]);
        this.questionStatus.set(`Streaming… ${validItems.length} Q&A`);
      }
    });
  }

  async loadExistingCategories(): Promise<void> {
    try {
      const response = await firstValueFrom(this.aiBackend.getExistingCategories());
      this.existingCategories.set(response.categories || []);
    } catch {
      this.existingCategories.set([]);
    }
  }

  async generateCategories(topic: string, integration: QaIntegrationMode, webSearch: boolean): Promise<void> {
    if (!topic.trim() || this.categoryLoading()) return;

    this.categoryAbortController = new AbortController();
    this.categoryLoading.set(true);
    this.categoryError.set('');
    this.categoryStatus.set('Generating categories…');

    const request: CategoryTreeRequest = {
      message: topic.trim(),
      tree: cloneCategoryTree(this.tree()),
      web_search: webSearch,
    };

    try {
      const response = integration === 'vercel-ai-sdk'
        ? await this.generateCategoriesWithVercel(request)
        : await this.generateCategoriesWithCopilot(request);
      this.applyCategoryResponse(response);
    } catch (error) {
      if (this.categoryAbortController?.signal.aborted) return;
      this.categoryError.set(this.formatError(error));
      this.categoryStatus.set('Category generation failed');
    } finally {
      this.categoryAbortController = null;
      this.categoryLoading.set(false);
    }
  }

  async generateQuestions(integration: QaIntegrationMode, webSearch: boolean): Promise<void> {
    if (!this.tree().length || this.questionLoading()) return;

    this.questionAbortController = new AbortController();
    this.questionLoading.set(true);
    this.questionError.set('');
    this.questionStatus.set('Generating Q&A…');
    this.questions.set([]);

    const request: QuestionAnswerRequest = {
      tree: cloneCategoryTree(this.tree()),
      web_search: webSearch,
    };

    try {
      const response = integration === 'vercel-ai-sdk'
        ? await this.generateQuestionsWithVercel(request)
        : await this.generateQuestionsWithCopilot(request);
      this.applyQuestionResponse(response);
    } catch (error) {
      if (this.questionAbortController?.signal.aborted) return;
      this.questionError.set(this.formatError(error));
      this.questionStatus.set('Q&A generation failed');
    } finally {
      this.questionAbortController = null;
      this.questionLoading.set(false);
    }
  }

  stopCategories(): void {
    this.categoryObject.stop();
    this.categoryAbortController?.abort();
    this.categoryAbortController = null;
    this.categoryLoading.set(false);
    this.categoryStatus.set('Cancelled');
  }

  stopQuestions(): void {
    this.questionObject.stop();
    this.questionAbortController?.abort();
    this.questionAbortController = null;
    this.questionLoading.set(false);
    this.questionStatus.set('Cancelled');
  }

  // ---- Private helpers --------------------------------------------------

  private makePartialCategoryNode(n: any): CategoryNode {
    return {
      id: n.id,
      title: n.title,
      questionCount: Number(n.questionCount) || 3,
      children: Array.isArray(n.children)
        ? n.children.filter((c: any) => c?.id && c?.title).map((c: any) => this.makePartialCategoryNode(c))
        : [],
      matchedExistingCategoryId: n.matchedExistingCategoryId ?? null,
      matchedExistingCategoryTitle: n.matchedExistingCategoryTitle ?? null,
      isExistingCategory: Boolean(n.isExistingCategory),
    };
  }

  private async generateCategoriesWithVercel(request: CategoryTreeRequest): Promise<CategoryTreeResponse> {
    await this.categoryObject.submit(request);
    if (this.categoryObject.error) throw this.categoryObject.error;
    return this.categoryObject.object as CategoryTreeResponse;
  }

  private async generateQuestionsWithVercel(request: QuestionAnswerRequest): Promise<QuestionAnswerResponse> {
    await this.questionObject.submit(request);
    if (this.questionObject.error) throw this.questionObject.error;
    return this.questionObject.object as QuestionAnswerResponse;
  }

  private async generateCategoriesWithCopilot(request: CategoryTreeRequest): Promise<CategoryTreeResponse> {
    return this.runCopilotStructuredJson(
      [
        'Generate a LifeSuite learning category tree.',
        'Return only raw JSON. Do not wrap it in markdown fences.',
        'Shape: { "assistantMessage": string, "modelName"?: string, "tree": CategoryNode[] }',
        'CategoryNode: { "id": string, "title": string, "questionCount": number, "children": CategoryNode[], "matchedExistingCategoryId"?: string|null, "matchedExistingCategoryTitle"?: string|null, "isExistingCategory"?: boolean }',
        'Return one root node with at least 6 subcategories for a new topic.',
        'Preserve existing node ids when refining.',
        `Existing categories: ${JSON.stringify(this.existingCategories())}`,
        `Request: ${JSON.stringify(request)}`,
      ].join('\n\n'),
      categoryTreeResponseSchema,
    );
  }

  private async generateQuestionsWithCopilot(request: QuestionAnswerRequest): Promise<QuestionAnswerResponse> {
    return this.runCopilotStructuredJson(
      [
        'Generate LifeSuite learning flashcard Q&A pairs for the supplied category tree.',
        'Return only raw JSON. Do not wrap it in markdown fences.',
        'Shape: { "modelName"?: string, "items": QuestionAnswer[] }',
        'QuestionAnswer: { "categoryId": string, "categoryPath": string, "question": string, "answer": string }',
        'Generate exactly the questionCount items per category.',
        `Request: ${JSON.stringify(request)}`,
      ].join('\n\n'),
      questionAnswerResponseSchema,
    );
  }

  private async runCopilotStructuredJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
    const store = this.copilotStore();
    const agent = store.agent;
    const previousMessageIds = new Set(store.messages().map(m => m.id));

    agent.addMessage({ id: randomUUID(), role: 'user', content: prompt } as Message);
    await this.copilotKit.core.runAgent({ agent });

    const assistantMessage = [...store.messages()]
      .reverse()
      .find(m => !previousMessageIds.has(m.id) && m.role === 'assistant' && typeof m.content === 'string');
    const content = typeof assistantMessage?.content === 'string' ? assistantMessage.content : '';

    if (!content) throw new Error('CopilotKit agent did not return a structured response');
    return this.parseStructuredJson(content, schema);
  }

  private parseStructuredJson<T>(content: string, schema: z.ZodType<T>): T {
    const jsonText = this.extractJsonObject(content);
    const parsed = schema.safeParse(JSON.parse(jsonText));
    if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join('; '));
    return parsed.data;
  }

  private extractJsonObject(content: string): string {
    const start = content.indexOf('{');
    if (start === -1) throw new Error('Response did not contain a JSON object');
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < content.length; i++) {
      const c = content[i];
      if (esc) { esc = false; continue; }
      if (c === '\\' && inStr) { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (!inStr) {
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return content.slice(start, i + 1); }
      }
    }
    return content.slice(start);
  }

  private applyCategoryResponse(response: CategoryTreeResponse | undefined): void {
    const tree = response?.tree;
    if (tree?.length) {
      this.tree.set(tree);
    }
    this.modelName.set(response?.modelName || this.modelName());
    const count = countCategoryNodes(this.tree());
    this.categoryStatus.set(response?.assistantMessage || `Generated ${count} categories`);
  }

  private applyQuestionResponse(response: QuestionAnswerResponse | undefined): void {
    const items = response?.items || [];
    this.questions.set(items);
    this.modelName.set(response?.modelName || this.modelName());
    this.questionStatus.set(`Generated ${items.length} Q&A`);
  }

  private formatError(error: unknown): string {
    return error instanceof Error ? error.message : String(error || 'Unknown AI error');
  }
}
