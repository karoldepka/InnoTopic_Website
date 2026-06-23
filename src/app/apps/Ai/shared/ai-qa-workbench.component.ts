import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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
import {
  CategoryTreeRow,
  addCategoryChild,
  cloneCategoryTree,
  countCategoryNodes,
  deleteCategoryNode,
  filterVisibleRows,
  flattenCategoryTree,
  sumQuestionCounts,
  updateCategoryNode,
} from './ai-qa-tree.utils';

export type QaIntegrationMode = 'vercel-ai-sdk' | 'copilotkit';

const COPILOT_AGENT_ID = 'lifesuite-qa';

const categoryNodeSchema: z.ZodType<CategoryNode> = z.lazy(() => z.object({
  id: z.string(),
  title: z.string(),
  questionCount: z.number(),
  children: z.array(categoryNodeSchema),
  matchedExistingCategoryId: z.string().nullable().optional(),
  matchedExistingCategoryTitle: z.string().nullable().optional(),
  isExistingCategory: z.boolean().optional(),
}));

const categoryTreeResponseSchema: z.ZodType<CategoryTreeResponse> = z.object({
  tree: z.array(categoryNodeSchema),
  assistantMessage: z.string(),
  modelName: z.string().optional(),
  searchResults: z.array(z.string()).optional(),
});

const questionAnswerSchema: z.ZodType<QuestionAnswer> = z.object({
  categoryId: z.string(),
  categoryPath: z.string(),
  question: z.string(),
  answer: z.string(),
});

const questionAnswerResponseSchema: z.ZodType<QuestionAnswerResponse> = z.object({
  items: z.array(questionAnswerSchema),
  modelName: z.string().optional(),
  searchResults: z.array(z.string()).optional(),
});

@Component({
  selector: 'app-ai-qa-workbench',
  templateUrl: './ai-qa-workbench.component.html',
  styleUrls: ['./ai-qa-workbench.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AiQaWorkbenchComponent implements OnInit {
  @Input() integration: QaIntegrationMode = 'vercel-ai-sdk';
  @Input() integrationTitle = 'Vercel AI SDK';
  @Input() integrationSubtitle = '@ai-sdk/angular StructuredObject';

  private readonly aiBackend = inject(AiBackendService);
  private readonly copilotKit = inject(CopilotKit);
  private readonly copilotStore = injectAgentStore(COPILOT_AGENT_ID);
  private readonly categoryObject = new StructuredObject<typeof categoryTreeResponseSchema, CategoryTreeResponse, CategoryTreeRequest>({
    api: this.aiBackend.apiUrl('/category-tree/stream-json'),
    schema: categoryTreeResponseSchema,
    ...({ streamProtocol: 'text' } as object),
  });
  private readonly questionObject = new StructuredObject<typeof questionAnswerResponseSchema, QuestionAnswerResponse, QuestionAnswerRequest>({
    api: this.aiBackend.apiUrl('/category-tree/questions/stream-json'),
    schema: questionAnswerResponseSchema,
    ...({ streamProtocol: 'text' } as object),
  });

  readonly topic = signal('Rust interview questions');
  readonly webSearch = signal(true);
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

  private categoryAbortController: AbortController | null = null;
  private questionAbortController: AbortController | null = null;
  readonly showAnswers = signal(false);
  readonly expandedAnswerKeys = signal<ReadonlySet<string>>(new Set<string>());

  readonly collapsedNodeIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly allCategoryRows = computed(() => flattenCategoryTree(this.tree()));
  readonly categoryRows = computed(() => filterVisibleRows(this.allCategoryRows(), this.collapsedNodeIds()));
  readonly categoryCount = computed(() => countCategoryNodes(this.tree()));
  readonly requestedQuestionCount = computed(() => sumQuestionCounts(this.tree()));

  constructor() {
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

    effect(() => {
      if (!this.questionLoading()) return;
      const partial = this.questionObject.object as any;
      const items: any[] = Array.isArray(partial?.items) ? partial.items : [];
      const validItems = items.filter(i => i?.question && i?.answer);
      if (validItems.length > 0) {
        this.questions.set(validItems as QuestionAnswer[]);
        this.questionStatus.set(`Streaming… ${validItems.length} Q&A`);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const response = await firstValueFrom(this.aiBackend.getExistingCategories());
      this.existingCategories.set(response.categories || []);
    } catch {
      this.existingCategories.set([]);
    }
  }

  setTopic(value: string | null | undefined): void {
    this.topic.set(value || '');
  }

  setExampleTopic(topic: string): void {
    this.topic.set(topic);
  }

  setWebSearch(value: boolean): void {
    this.webSearch.set(value);
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

  nodeIndent(depth: number): string {
    return `${Math.min(depth, 8) * 18}px`;
  }

  async generateCategories(): Promise<void> {
    const message = this.topic().trim();
    if (!message || this.categoryLoading()) {
      return;
    }

    this.categoryAbortController = new AbortController();
    this.categoryLoading.set(true);
    this.categoryError.set('');
    this.categoryStatus.set('Generating categories');

    const request: CategoryTreeRequest = {
      message,
      tree: cloneCategoryTree(this.tree()),
      web_search: this.webSearch(),
    };

    try {
      const response = this.integration === 'vercel-ai-sdk'
        ? await this.generateCategoriesWithVercel(request)
        : await this.generateCategoriesWithCopilot(request);

      this.applyCategoryResponse(response);
    } catch (error) {
      if (this.categoryAbortController?.signal.aborted) {
        return;
      }
      this.categoryError.set(this.formatError(error));
      this.categoryStatus.set('Category generation failed');
    } finally {
      this.categoryAbortController = null;
      this.categoryLoading.set(false);
    }
  }

  async generateQuestions(): Promise<void> {
    if (!this.tree().length || this.questionLoading()) {
      return;
    }

    this.questionAbortController = new AbortController();
    this.questionLoading.set(true);
    this.questionError.set('');
    this.questionStatus.set('Generating Q&A');
    this.questions.set([]);
    this.expandedAnswerKeys.set(new Set<string>());

    const request: QuestionAnswerRequest = {
      tree: cloneCategoryTree(this.tree()),
      web_search: this.webSearch(),
    };

    try {
      const response = this.integration === 'vercel-ai-sdk'
        ? await this.generateQuestionsWithVercel(request)
        : await this.generateQuestionsWithCopilot(request);

      this.applyQuestionResponse(response);
    } catch (error) {
      if (this.questionAbortController?.signal.aborted) {
        return;
      }
      this.questionError.set(this.formatError(error));
      this.questionStatus.set('Q&A generation failed');
    } finally {
      this.questionAbortController = null;
      this.questionLoading.set(false);
    }
  }

  addRootCategory(): void {
    this.tree.set(addCategoryChild(this.tree()));
  }

  addChildCategory(parentId: string): void {
    this.tree.set(addCategoryChild(this.tree(), parentId));
  }

  deleteCategory(nodeId: string): void {
    this.tree.set(deleteCategoryNode(this.tree(), nodeId));
  }

  renameCategory(nodeId: string, title: string): void {
    this.tree.set(updateCategoryNode(this.tree(), nodeId, node => ({
      ...node,
      title,
    })));
  }

  isCategoryCollapsed(nodeId: string): boolean {
    return this.collapsedNodeIds().has(nodeId);
  }

  toggleCategoryCollapsed(nodeId: string): void {
    const next = new Set(this.collapsedNodeIds());
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    this.collapsedNodeIds.set(next);
  }

  changeQuestionCount(nodeId: string, rawCount: string | number | null | undefined): void {
    const nextCount = Math.max(0, Math.min(50, Number(rawCount || 0)));
    this.tree.set(updateCategoryNode(this.tree(), nodeId, node => ({
      ...node,
      questionCount: Number.isFinite(nextCount) ? nextCount : 0,
    })));
  }

  answerKey(item: QuestionAnswer, index: number): string {
    return `${item.categoryId || item.categoryPath || 'qa'}-${index}`;
  }

  answerVisible(item: QuestionAnswer, index: number): boolean {
    return this.showAnswers() || this.expandedAnswerKeys().has(this.answerKey(item, index));
  }

  toggleAnswer(item: QuestionAnswer, index: number): void {
    const key = this.answerKey(item, index);
    const keys = new Set(this.expandedAnswerKeys());
    if (keys.has(key)) {
      keys.delete(key);
    } else {
      keys.add(key);
    }
    this.expandedAnswerKeys.set(keys);
  }

  async copyQuestions(): Promise<void> {
    const text = this.questions()
      .map((item, index) => [
        `${index + 1}. ${item.question}`,
        `A: ${item.answer}`,
        item.categoryPath ? `Category: ${item.categoryPath}` : '',
      ].filter(Boolean).join('\n'))
      .join('\n\n');

    if (!text) {
      return;
    }

    await navigator.clipboard?.writeText(text);
    this.questionStatus.set(`Copied ${this.questions().length} Q&A`);
  }

  exportJson(): void {
    const payload = JSON.stringify({
      topic: this.topic(),
      tree: this.tree(),
      questions: this.questions(),
    }, null, 2);
    const blob = new Blob([payload], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lifesuite-ai-q-and-a.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  trackCategoryRow(_index: number, row: CategoryTreeRow): string {
    return row.node.id;
  }

  trackQuestion(index: number, item: QuestionAnswer): string {
    return this.answerKey(item, index);
  }

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
    if (this.categoryObject.error) {
      throw this.categoryObject.error;
    }
    return this.categoryObject.object as CategoryTreeResponse;
  }

  private async generateQuestionsWithVercel(request: QuestionAnswerRequest): Promise<QuestionAnswerResponse> {
    await this.questionObject.submit(request);
    if (this.questionObject.error) {
      throw this.questionObject.error;
    }
    return this.questionObject.object as QuestionAnswerResponse;
  }

  private async generateCategoriesWithCopilot(request: CategoryTreeRequest): Promise<CategoryTreeResponse> {
    return this.runCopilotStructuredJson(
      [
        'Generate a LifeSuite learning category tree.',
        'Return only raw JSON. Do not wrap it in markdown fences. Do not add text before or after JSON.',
        'The JSON must match this TypeScript shape:',
        '{ "assistantMessage": string, "modelName"?: string, "tree": CategoryNode[] }',
        'CategoryNode shape:',
        '{ "id": string, "title": string, "questionCount": number, "children": CategoryNode[], "matchedExistingCategoryId"?: string | null, "matchedExistingCategoryTitle"?: string | null, "isExistingCategory"?: boolean }',
        'For a new topic, return one useful root category with at least six useful subcategories unless the request says otherwise.',
        'Preserve existing node ids when refining an existing tree.',
        'Match generated categories to existing categories when semantically appropriate.',
        `Existing categories: ${JSON.stringify(this.existingCategories())}`,
        `Request: ${JSON.stringify(request)}`,
      ].join('\n\n'),
      categoryTreeResponseSchema,
    );
  }

  private async generateQuestionsWithCopilot(request: QuestionAnswerRequest): Promise<QuestionAnswerResponse> {
    return this.runCopilotStructuredJson(
      [
        'Generate LifeSuite learning question-and-answer cards for the supplied category tree.',
        'Return only raw JSON. Do not wrap it in markdown fences. Do not add text before or after JSON.',
        'The JSON must match this TypeScript shape:',
        '{ "modelName"?: string, "items": QuestionAnswer[] }',
        'QuestionAnswer shape:',
        '{ "categoryId": string, "categoryPath": string, "question": string, "answer": string }',
        'Generate the number of Q&A items requested by each category questionCount.',
        'Keep answers concise but complete enough to study from.',
        `Request: ${JSON.stringify(request)}`,
      ].join('\n\n'),
      questionAnswerResponseSchema,
    );
  }

  private async runCopilotStructuredJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
    const store = this.copilotStore();
    const agent = store.agent;
    const previousMessageIds = new Set(store.messages().map(message => message.id));

    agent.addMessage({
      id: randomUUID(),
      role: 'user',
      content: prompt,
    } as Message);

    await this.copilotKit.core.runAgent({ agent });

    const assistantMessage = [...store.messages()]
      .reverse()
      .find(message => !previousMessageIds.has(message.id) && message.role === 'assistant' && typeof message.content === 'string');
    const assistantContent = typeof assistantMessage?.content === 'string'
      ? assistantMessage.content
      : '';

    if (!assistantContent) {
      throw new Error('CopilotKit agent did not return a structured response');
    }

    return this.parseStructuredJson(assistantContent, schema);
  }

  private parseStructuredJson<T>(content: string, schema: z.ZodType<T>): T {
    const jsonText = this.extractJsonObject(content);
    const parsed = schema.safeParse(JSON.parse(jsonText));
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map(issue => issue.message).join('; '));
    }
    return parsed.data;
  }

  private extractJsonObject(content: string): string {
    const withoutFence = content
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();
    const firstBrace = withoutFence.indexOf('{');
    const lastBrace = withoutFence.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('CopilotKit response did not contain a JSON object');
    }
    return withoutFence.slice(firstBrace, lastBrace + 1);
  }

  private applyCategoryResponse(response: CategoryTreeResponse | undefined): void {
    const tree = response?.tree || [];
    this.tree.set(tree);
    this.modelName.set(response?.modelName || this.modelName());
    this.categoryStatus.set(response?.assistantMessage || `Generated ${countCategoryNodes(tree)} categories`);
  }

  private applyQuestionResponse(response: QuestionAnswerResponse | undefined): void {
    const items = response?.items || [];
    this.questions.set(items);
    this.modelName.set(response?.modelName || this.modelName());
    this.questionStatus.set(`Generated ${items.length} Q&A`);
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error || 'Unknown AI error');
  }
}
