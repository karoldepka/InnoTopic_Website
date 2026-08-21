import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CategoryNode, QuestionAnswer } from '../../Learn/core/ai-backend.service';
import {
  CategoryTreeRow,
  addCategoryChild,
  cloneCategoryTree,
  deleteCategoryNode,
  filterVisibleRows,
  flattenCategoryTree,
  sumQuestionCounts,
  updateCategoryNode,
} from './ai-qa-tree.utils';
import { AiQaGeneratorService, QaIntegrationMode } from './ai-qa-generator.service';
import { QaDraftStore } from './qa-draft.store';

@Component({
  selector: 'app-ai-qa-workbench',
  templateUrl: './ai-qa-workbench.component.html',
  styleUrls: ['./ai-qa-workbench.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IonicModule],
  providers: [AiQaGeneratorService],
})
export class AiQaWorkbenchComponent implements OnInit {
  @Input() integration: QaIntegrationMode = 'vercel-ai-sdk';
  @Input() integrationTitle = 'Vercel AI SDK';
  @Input() integrationSubtitle = '@ai-sdk/angular StructuredObject';

  protected readonly gen = inject(AiQaGeneratorService);
  private readonly draftStore = inject(QaDraftStore);

  // UI-only signals
  readonly topic = signal('Agentic AI & UI interview questions');
  readonly webSearch = signal(true);
  readonly showAnswers = signal(false);
  readonly expandedAnswerKeys = signal<ReadonlySet<string>>(new Set<string>());
  readonly collapsedNodeIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly lastDeletedTree = signal<CategoryNode[] | null>(null);
  private undoClearHandle: ReturnType<typeof setTimeout> | null = null;

  /** Don't persist until the saved draft has been loaded, to avoid clobbering it. */
  private hasLoadedDraft = false;

  // Derived from service state
  readonly allCategoryRows = computed(() => flattenCategoryTree(this.gen.tree()));
  readonly categoryRows = computed(() => filterVisibleRows(this.allCategoryRows(), this.collapsedNodeIds()));
  readonly requestedQuestionCount = computed(() => sumQuestionCounts(this.gen.tree()));

  constructor() {
    // Auto-save all generated and user-provided data to IndexedDB whenever it
    // changes, so nothing is lost on page reload.
    effect(() => {
      const topic = this.topic();
      const webSearch = this.webSearch();
      const tree = this.gen.tree();
      const questions = this.gen.questions();
      if (!this.hasLoadedDraft) return;
      void this.draftStore.save(
        { topic, tree, questions, webSearch, savedAt: Date.now() },
        this.draftKey,
      );
    });
  }

  private get draftKey(): string {
    return `workbench:${this.integration}`;
  }

  async ngOnInit(): Promise<void> {
    await this.gen.loadExistingCategories();
    try {
      const draft = await this.draftStore.load(this.draftKey);
      if (draft) {
        if (draft.topic) this.topic.set(draft.topic);
        if (typeof draft.webSearch === 'boolean') this.webSearch.set(draft.webSearch);
        this.gen.restoreFromDraft(draft.tree, draft.questions);
      }
    } catch (e) {
      console.warn('[draft] Failed to restore workbench draft:', e);
    } finally {
      this.hasLoadedDraft = true;
    }
  }

  // ---- Topic & options --------------------------------------------------

  setTopic(value: string | null | undefined): void { this.topic.set(value || ''); }
  setWebSearch(value: boolean): void { this.webSearch.set(value); }

  // ---- Generation -------------------------------------------------------

  generateCategories(): void {
    this.gen.generateCategories(this.topic(), this.integration, this.webSearch());
  }

  generateQuestions(): void {
    this.gen.generateQuestions(this.integration, this.webSearch());
    this.expandedAnswerKeys.set(new Set<string>());
  }

  stopCategories(): void { this.gen.stopCategories(); }
  stopQuestions(): void { this.gen.stopQuestions(); }

  // ---- Tree edits -------------------------------------------------------

  addRootCategory(): void {
    this.gen.tree.set(addCategoryChild(this.gen.tree()));
  }

  addChildCategory(parentId: string): void {
    this.gen.tree.set(addCategoryChild(this.gen.tree(), parentId));
  }

  deleteCategory(nodeId: string): void {
    if (this.undoClearHandle !== null) clearTimeout(this.undoClearHandle);
    this.lastDeletedTree.set(cloneCategoryTree(this.gen.tree()));
    this.gen.tree.set(deleteCategoryNode(this.gen.tree(), nodeId));
    this.undoClearHandle = setTimeout(() => {
      this.lastDeletedTree.set(null);
      this.undoClearHandle = null;
    }, 8000);
  }

  undoDelete(): void {
    const saved = this.lastDeletedTree();
    if (!saved) return;
    this.gen.tree.set(saved);
    this.lastDeletedTree.set(null);
    if (this.undoClearHandle !== null) {
      clearTimeout(this.undoClearHandle);
      this.undoClearHandle = null;
    }
  }

  renameCategory(nodeId: string, title: string): void {
    this.gen.tree.set(updateCategoryNode(this.gen.tree(), nodeId, node => ({ ...node, title })));
  }

  changeQuestionCount(nodeId: string, rawCount: string | number | null | undefined): void {
    const count = Math.max(0, Math.min(50, Number(rawCount || 0)));
    this.gen.tree.set(updateCategoryNode(this.gen.tree(), nodeId, node => ({
      ...node,
      questionCount: Number.isFinite(count) ? count : 0,
    })));
  }

  // ---- Tree UI ----------------------------------------------------------

  isCategoryCollapsed(nodeId: string): boolean {
    return this.collapsedNodeIds().has(nodeId);
  }

  toggleCategoryCollapsed(nodeId: string): void {
    const next = new Set(this.collapsedNodeIds());
    next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
    this.collapsedNodeIds.set(next);
  }

  nodeIndent(depth: number): string {
    return `${Math.min(depth, 8) * 18}px`;
  }

  // ---- Q&A UI -----------------------------------------------------------

  answerKey(item: QuestionAnswer, index: number): string {
    return `${item.categoryId || item.categoryPath || 'qa'}-${index}`;
  }

  answerVisible(item: QuestionAnswer, index: number): boolean {
    return this.showAnswers() || this.expandedAnswerKeys().has(this.answerKey(item, index));
  }

  toggleAnswer(item: QuestionAnswer, index: number): void {
    const key = this.answerKey(item, index);
    const keys = new Set(this.expandedAnswerKeys());
    keys.has(key) ? keys.delete(key) : keys.add(key);
    this.expandedAnswerKeys.set(keys);
  }

  // ---- Export -----------------------------------------------------------

  async copyQuestions(): Promise<void> {
    const text = this.gen.questions()
      .map((item, i) => [
        `${i + 1}. ${item.question}`,
        `A: ${item.answer}`,
        item.categoryPath ? `Category: ${item.categoryPath}` : '',
      ].filter(Boolean).join('\n'))
      .join('\n\n');
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    this.gen.questionStatus.set(`Copied ${this.gen.questions().length} Q&A`);
  }

  exportJson(): void {
    const payload = JSON.stringify({
      topic: this.topic(),
      tree: this.gen.tree(),
      questions: this.gen.questions(),
    }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lifesuite-ai-q-and-a.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // ---- Track-by helpers ------------------------------------------------

  trackCategoryRow(_index: number, row: CategoryTreeRow): string { return row.node.id; }
  trackQuestion(index: number, item: QuestionAnswer): string { return this.answerKey(item, index); }
}
