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
  FileTreeRequest,
  QuestionAnswer,
  QuestionAnswerRequest,
  QuestionAnswerResponse,
} from '../../Learn/core/ai-backend.service';
import {
  cloneCategoryTree,
  countCategoryNodes,
  countLeafNodes,
  flattenCategoryTree,
  isTruncatedText,
  setLeafQuestionCounts,
  sumQuestionCounts,
  updateCategoryNode,
} from './ai-qa-tree.utils';
import {QaDuplicateDetectorService} from './qa-duplicate-detector.service';
import {showDesktopNotification} from '../../../libs/AppFedShared/utils/desktop-notification';
import {errorAlert} from '../../../libs/AppFedShared/utils/log';

export type QaIntegrationMode = 'vercel-ai-sdk' | 'copilotkit';

export interface CategoryChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
  private readonly duplicateDetector = inject(QaDuplicateDetectorService);

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
  /** GH #130: the picked local directory, if any - set once (before generateCategories()) and
   * read by both category and Q&A generation, since Q&A generation happens in a later, separate
   * call that still needs the same file contents to write content-grounded questions. */
  readonly fileTree = signal<FileTreeRequest | undefined>(undefined);
  readonly tree = signal<CategoryNode[]>([]);
  /** Chat-based refinement of `tree` (renaming/merging/splitting/adding via natural language) -
   * see refineCategoriesViaChat()'s own comment for why this replaces the tree rather than
   * appending to it like generateCategories() does. */
  readonly categoryChatMessages = signal<CategoryChatMessage[]>([]);
  readonly questions = signal<QuestionAnswer[]>([]);
  readonly existingCategories = signal<ExistingCategory[]>([]);
  readonly modelName = signal('');
  readonly categoryStatus = signal('Ready');
  readonly questionStatus = signal('Ready');
  readonly categoryError = signal('');
  readonly questionError = signal('');
  readonly categoryLoading = signal(false);
  readonly questionLoading = signal(false);
  readonly subcategoryLoading = signal(false);
  /** Indices into `questions()` currently fetching an illustration - a Set rather than a single
   * flag since generating an image for one card shouldn't block doing the same for another. */
  readonly questionImageLoadingIndices = signal<ReadonlySet<number>>(new Set());

  readonly categoryCount = computed(() => countCategoryNodes(this.tree()));

  private categoryAbortController: AbortController | null = null;
  private questionAbortController: AbortController | null = null;

  private appendMode = false;
  private preAppendQuestions: QuestionAnswer[] = [];
  private categoryAppendMode = false;
  private preAppendTree: CategoryNode[] = [];

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
        const all = this.categoryAppendMode
          ? [...this.preAppendTree, ...validNodes]
          : validNodes;
        this.tree.set(all);
        this.categoryStatus.set(
          `${this.categoryAppendMode ? 'Adding' : 'Streaming'}… ${validNodes.length} categories`,
        );
      }
    });

    // Live-update questions from streaming partial JSON
    effect(() => {
      if (!this.questionLoading()) return;
      const partial = this.questionObject.object as any;
      const items: any[] = Array.isArray(partial?.items) ? partial.items : [];
      const validItems = items.filter(i => i?.question);
      if (validItems.length > 0) {
        const all = this.appendMode
          ? [...this.preAppendQuestions, ...(validItems as QuestionAnswer[])]
          : validItems as QuestionAnswer[];
        this.questions.set(all);
        this.questionStatus.set(`${this.appendMode ? 'Adding' : 'Streaming'}… ${validItems.length} Q&A`);
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

  async generateCategories(topic: string, integration: QaIntegrationMode, webSearch: boolean, matchExisting = false): Promise<void> {
    // GH #130: a picked directory makes the text topic optional guidance rather than required -
    // "no prompt" means "go broad and deep on the whole directory" per the request, not "nothing
    // to generate from".
    const fileTree = this.fileTree();
    if ((!topic.trim() && !fileTree) || this.categoryLoading()) return;

    // Preserve any categories already present and append the freshly generated ones.
    const existing = this.tree();
    this.categoryAppendMode = existing.length > 0;
    this.preAppendTree = this.categoryAppendMode ? cloneCategoryTree(existing) : [];

    this.categoryAbortController = new AbortController();
    this.categoryLoading.set(true);
    this.categoryError.set('');
    this.categoryStatus.set(fileTree ? `Generating categories for "${fileTree.rootName}"…` : 'Generating categories…');
    this.tree.set(this.preAppendTree);

    const request: CategoryTreeRequest = {
      message: topic.trim(),
      tree: cloneCategoryTree(this.preAppendTree),
      web_search: webSearch,
      match_existing: matchExisting,
      fileTree,
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
      this.categoryAppendMode = false;
      this.preAppendTree = [];
    }
  }

  /** Refines the *existing* tree via a natural-language instruction ("merge the Rust and Go
   * categories", "make these more beginner-friendly", "drop anything about deployment") - unlike
   * generateCategories() (topic -> brand new tree, or appended alongside an existing one for
   * "also cover Y" style requests), this always replaces `tree` with the response. The backend
   * prompt (buildCategoryTreeMessages in prompts.ts) already sends the current tree back to the
   * model as context and is instructed to "preserve relevant nodes" while applying the new
   * message, so its response *is* the intended new full state - appending here (like
   * generateCategories() does) would just pile the edited tree up alongside the untouched
   * original instead of actually applying the edit. `assistantMessage` (part of the response
   * schema already) is shown back in the chat thread as the model's reply. */
  async refineCategoriesViaChat(message: string, integration: QaIntegrationMode, webSearch: boolean): Promise<void> {
    const trimmed = message.trim();
    if (!trimmed || this.categoryLoading()) return;

    this.categoryChatMessages.update(msgs => [...msgs, {role: 'user', content: trimmed}]);

    this.categoryAbortController = new AbortController();
    this.categoryLoading.set(true);
    this.categoryError.set('');
    this.categoryStatus.set('Refining categories…');

    const request: CategoryTreeRequest = {
      message: trimmed,
      tree: cloneCategoryTree(this.tree()),
      web_search: webSearch,
      fileTree: this.fileTree(),
      isRefinement: true,
    };

    try {
      const response = integration === 'vercel-ai-sdk'
        ? await this.generateCategoriesWithVercel(request)
        : await this.generateCategoriesWithCopilot(request);
      const now = Date.now();
      this.tree.set(this.stampTreeDraftedAt(response.tree ?? [], now));
      this.modelName.set(response.modelName || this.modelName());
      const count = countCategoryNodes(this.tree());
      this.categoryStatus.set(`${count} categories`);
      this.categoryChatMessages.update(msgs => [
        ...msgs,
        {role: 'assistant', content: response.assistantMessage || `Updated - ${count} categories now.`},
      ]);
    } catch (error) {
      if (this.categoryAbortController?.signal.aborted) return;
      const msg = this.formatError(error);
      this.categoryError.set(msg);
      this.categoryStatus.set('Refinement failed');
      this.categoryChatMessages.update(msgs => [...msgs, {role: 'assistant', content: `Could not apply that: ${msg}`}]);
    } finally {
      this.categoryAbortController = null;
      this.categoryLoading.set(false);
    }
  }

  async generateQuestions(integration: QaIntegrationMode, webSearch: boolean, abcdAnswers = false): Promise<void> {
    if (!this.tree().length || this.questionLoading()) return;

    // If questions already exist, append rather than replace.
    const existing = this.questions();
    if (existing.length) {
      this.appendMode = true;
      this.preAppendQuestions = [...existing];
    }

    this.questionAbortController = new AbortController();
    this.questionLoading.set(true);
    this.questionError.set('');
    this.questionStatus.set('Generating Q&A…');
    this.questions.set([]);

    const request: QuestionAnswerRequest = {
      tree: cloneCategoryTree(this.tree()),
      web_search: webSearch,
      abcd_answers: abcdAnswers,
      fileTree: this.fileTree(),
      ...(this.preAppendQuestions.length && {
        existingQuestions: this.preAppendQuestions.map(q => q.question),
      }),
    };
    const targetCount = this.preAppendQuestions.length + sumQuestionCounts(request.tree);
    const baseline = [...this.preAppendQuestions];

    try {
      const response = integration === 'vercel-ai-sdk'
        ? await this.generateQuestionsWithVercel(request)
        : await this.generateQuestionsWithCopilot(request);
      await this.reconcileQuestions(response, baseline, targetCount, integration, webSearch, abcdAnswers);
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

  approveQuestions(keep: ReadonlySet<number>): void {
    const now = Date.now();
    const kept = this.questions()
      .filter((_, i) => keep.has(i))
      .map(q => ({ ...q, approvedAt: now, lastModifiedAt: now }));
    this.questions.set(kept);
    this.questionStatus.set(`Kept ${kept.length} Q&A`);
  }

  rejectQuestions(remove: ReadonlySet<number>): void {
    const remaining = this.questions().filter((_, i) => !remove.has(i));
    this.questions.set(remaining);
    this.questionStatus.set(`${remaining.length} Q&A remaining`);
  }

  async generateMoreQuestions(
    integration: QaIntegrationMode,
    webSearch: boolean,
    additionalCount: number,
    abcdAnswers = false,
  ): Promise<void> {
    if (this.questionLoading()) return;

    this.appendMode = true;
    this.preAppendQuestions = [...this.questions()];

    const leafCount = countLeafNodes(this.tree());
    const perLeaf = Math.max(1, Math.ceil(additionalCount / Math.max(1, leafCount)));
    const adjustedTree = setLeafQuestionCounts(cloneCategoryTree(this.tree()), perLeaf);

    this.questionAbortController = new AbortController();
    this.questionLoading.set(true);
    this.questionError.set('');
    this.questionStatus.set(`Adding ${additionalCount} more Q&A…`);

    const request: QuestionAnswerRequest = {
      tree: adjustedTree,
      web_search: webSearch,
      abcd_answers: abcdAnswers,
      fileTree: this.fileTree(),
      existingQuestions: this.preAppendQuestions.map(q => q.question),
    };
    const targetCount = this.preAppendQuestions.length + additionalCount;
    const baseline = [...this.preAppendQuestions];

    try {
      const response = integration === 'vercel-ai-sdk'
        ? await this.generateQuestionsWithVercel(request)
        : await this.generateQuestionsWithCopilot(request);
      await this.reconcileQuestions(response, baseline, targetCount, integration, webSearch, abcdAnswers);
    } catch (error) {
      if (this.questionAbortController?.signal.aborted) return;
      this.appendMode = false;
      this.preAppendQuestions = [];
      this.questionError.set(this.formatError(error));
      this.questionStatus.set('Q&A generation failed');
    } finally {
      this.questionAbortController = null;
      this.questionLoading.set(false);
    }
  }

  async generateSubcategories(
    parentNodeId: string,
    topic: string,
    count: number,
    webSearch: boolean,
  ): Promise<void> {
    if (this.subcategoryLoading()) return;
    this.subcategoryLoading.set(true);

    const allRows = flattenCategoryTree(this.tree());
    const parentRow = allRows.find(r => r.node.id === parentNodeId);
    if (!parentRow) { this.subcategoryLoading.set(false); return; }

    const request = {
      parentId: parentNodeId,
      parentTitle: parentRow.node.title,
      parentPath: parentRow.path,
      topic,
      existingChildTitles: parentRow.node.children.map(c => c.title),
      count,
      web_search: webSearch,
    };

    try {
      const res = await fetch(this.aiBackend.apiUrl('/category-tree/more-children'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
      }
      text += dec.decode();

      const data = JSON.parse(text);
      const newChildren: CategoryNode[] = (data.children ?? []).filter((c: any) => c?.id && c?.title);
      if (newChildren.length) {
        const now = Date.now();
        const stamped = this.stampTreeDraftedAt(newChildren, now);
        this.tree.set(
          updateCategoryNode(this.tree(), parentNodeId, node => ({
            ...node,
            children: [...node.children, ...stamped],
          }))
        );
      }
    } catch (error) {
      console.error('[subcategories]', error);
    } finally {
      this.subcategoryLoading.set(false);
    }
  }

  /** Generates (or regenerates) a single flashcard's illustration - always an explicit, one-at-a-
   * time user action (never triggered automatically alongside bulk category/Q&A generation),
   * since image generation is far more expensive per-item than the text generation above. */
  async generateQuestionImage(index: number): Promise<void> {
    const item = this.questions()[index];
    if (!item || this.questionImageLoadingIndices().has(index)) return;

    this.questionImageLoadingIndices.update(indices => new Set(indices).add(index));
    try {
      const response = await firstValueFrom(this.aiBackend.generateQuestionImage({
        question: item.question,
        answer: item.answer,
      }));
      const current = this.questions();
      if (current[index] === item) {
        const updated = [...current];
        updated[index] = { ...item, imageDataUrl: response.imageDataUrl };
        this.questions.set(updated);
      }
    } catch (error) {
      errorAlert('Could not generate an image for this flashcard', this.formatError(error));
    } finally {
      this.questionImageLoadingIndices.update(indices => {
        const next = new Set(indices);
        next.delete(index);
        return next;
      });
    }
  }

  restoreFromDraft(tree: CategoryNode[], questions: QuestionAnswer[]): void {
    this.tree.set(tree);
    this.questions.set(questions);
    // Chat isn't persisted in the draft (only its end result, `tree`, is) - clear it so a
    // restored session doesn't show a thread referring to a tree that's since been replaced.
    this.categoryChatMessages.set([]);
    const catCount = countCategoryNodes(tree);
    if (catCount) this.categoryStatus.set(`Restored — ${catCount} categories`);
    if (questions.length) this.questionStatus.set(`Restored — ${questions.length} Q&A`);
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
    const response = this.categoryObject.object as CategoryTreeResponse;
    const truncatedTitle = flattenCategoryTree(response?.tree ?? []).find(row => isTruncatedText(row.node.title));
    if (truncatedTitle) throw new Error(`Generation produced cut-off text ("${truncatedTitle.node.title}") - please try again`);
    return response;
  }

  private async generateQuestionsWithVercel(request: QuestionAnswerRequest): Promise<QuestionAnswerResponse> {
    await this.questionObject.submit(request);
    if (this.questionObject.error) throw this.questionObject.error;
    const response = this.questionObject.object as QuestionAnswerResponse;
    const truncated = (response?.items ?? []).find(item =>
      isTruncatedText(item.question) || isTruncatedText(item.answer) || isTruncatedText(item.categoryPath));
    if (truncated) throw new Error(`Generation produced cut-off text ("${truncated.question}") - please try again`);
    return response;
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
      const now = Date.now();
      const generated = this.stampTreeDraftedAt(tree, now);
      this.tree.set(
        this.categoryAppendMode ? [...this.preAppendTree, ...generated] : generated,
      );
    }
    this.modelName.set(response?.modelName || this.modelName());
    const count = countCategoryNodes(this.tree());
    this.categoryStatus.set(response?.assistantMessage || `Generated ${count} categories`);
    this.notifyGenerationFinished('Categories generated', `${count} categories ready in LifeSuite AI Q&A.`);
  }

  private stampQuestions(response: QuestionAnswerResponse | undefined): QuestionAnswer[] {
    const now = Date.now();
    return (response?.items || []).map(q => ({
      ...q,
      createdAt: q.createdAt ?? now,
      draftedAt: q.draftedAt ?? now,
      draftedByAIAt: q.draftedByAIAt ?? now,
      lastModifiedAt: q.lastModifiedAt ?? now,
      contentModifiedAt: q.contentModifiedAt ?? now,
    }));
  }

  private async reconcileQuestions(
    initialResponse: QuestionAnswerResponse | undefined,
    baseline: QuestionAnswer[],
    targetCount: number,
    integration: QaIntegrationMode,
    webSearch: boolean,
    abcdAnswers: boolean,
  ): Promise<void> {
    const maxReplacementRounds = 3;
    let response = initialResponse;
    let accepted = [...baseline];
    let excludedQuestions = baseline.map(item => item.question);
    let duplicateCount = 0;

    try {
      for (let round = 0; round <= maxReplacementRounds; round++) {
        if (this.questionAbortController?.signal.aborted) return;
        const candidates = this.stampQuestions(response);
        excludedQuestions.push(...candidates.map(item => item.question));

        const filtered = await this.duplicateDetector.removeDuplicates(candidates, accepted);
        duplicateCount += filtered.duplicateCount;
        accepted.push(...filtered.unique.slice(0, Math.max(0, targetCount - accepted.length)));
        this.questions.set(accepted);
        this.modelName.set(response?.modelName || this.modelName());

        const missing = targetCount - accepted.length;
        if (missing <= 0) {
          this.questionStatus.set(
            duplicateCount
              ? `Generated ${accepted.length} Q&A · replaced ${duplicateCount} duplicates`
              : `Generated ${accepted.length} Q&A`,
          );
          return;
        }
        if (round === maxReplacementRounds) {
          this.questionStatus.set(
            `Generated ${accepted.length}/${targetCount} Q&A · ${duplicateCount} duplicates removed after ${maxReplacementRounds} replacement rounds`,
          );
          return;
        }

        this.appendMode = true;
        this.preAppendQuestions = [...accepted];
        this.questionStatus.set(
          `Replacing ${missing} duplicate${missing === 1 ? '' : 's'}… round ${round + 1}/${maxReplacementRounds}`,
        );
        const leafCount = countLeafNodes(this.tree());
        const perLeaf = Math.max(1, Math.ceil(missing / Math.max(1, leafCount)));
        const replacementRequest: QuestionAnswerRequest = {
          tree: setLeafQuestionCounts(cloneCategoryTree(this.tree()), perLeaf),
          web_search: webSearch,
          abcd_answers: abcdAnswers,
          fileTree: this.fileTree(),
          existingQuestions: [...new Set(excludedQuestions)],
        };
        response = integration === 'vercel-ai-sdk'
          ? await this.generateQuestionsWithVercel(replacementRequest)
          : await this.generateQuestionsWithCopilot(replacementRequest);
      }
    } catch (error) {
      // Duplicate detection is derived-data enrichment. Keep generated questions if pgvector or
      // the embedding provider is unavailable; never turn that outage into lost generation work.
      const fallback = this.stampQuestions(response)
        .slice(0, Math.max(0, targetCount - accepted.length));
      accepted.push(...fallback);
      this.questions.set(accepted);
      this.questionStatus.set(`Generated ${accepted.length} Q&A · duplicate check unavailable`);
      console.error('[qa duplicate detection]', error);
    } finally {
      this.appendMode = false;
      this.preAppendQuestions = [];
      // Every branch above (clean finish, gave-up-after-replacement-rounds, or duplicate-check
      // unavailable) already stamped a final, human-readable questionStatus() - reuse it here
      // rather than re-deriving a separate message per branch.
      this.notifyGenerationFinished('Q&A generated', this.questionStatus());
    }
  }

  private stampTreeDraftedAt(nodes: CategoryNode[], now: number): CategoryNode[] {
    return nodes.map(n => ({
      ...n,
      createdAt: n.createdAt ?? now,
      draftedAt: n.draftedAt ?? now,
      draftedByAIAt: n.draftedByAIAt ?? now,
      contentModifiedAt: n.contentModifiedAt ?? now,
      children: this.stampTreeDraftedAt(n.children, now),
    }));
  }

  /** Only bothers the user with a desktop notification if they've actually navigated away/
   * switched tabs while this (slow, LLM-backed) generation was running - if the tab is still
   * focused they can already see the result land live via the streaming signals above. */
  private notifyGenerationFinished(title: string, body: string): void {
    if (typeof document !== 'undefined' && document.hasFocus()) {
      return;
    }
    void showDesktopNotification(title, {body});
  }

  private formatError(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error || 'Unknown AI error');
    // Backend returns 502 JSON like {"error":"Insufficient account balance"}
    // The StructuredObject may surface the raw JSON string as the error message
    try {
      const parsed = JSON.parse(msg);
      if (typeof parsed?.error === 'string') return parsed.error;
    } catch { /* not JSON */ }
    return msg;
  }
}
