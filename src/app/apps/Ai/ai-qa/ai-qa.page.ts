import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AiBackendService, CategoryNode, QuestionAnswer } from '../../Learn/core/ai-backend.service';
import {
  CategoryTreeRow,
  addCategoryChild,
  cloneCategoryTree,
  deleteCategoryNode,
  filterVisibleRows,
  flattenCategoryTree,
  sumQuestionCounts,
  updateCategoryNode,
} from '../shared/ai-qa-tree.utils';
import { AiQaGeneratorService } from '../shared/ai-qa-generator.service';

@Component({
  selector: 'app-ai-qa',
  templateUrl: './ai-qa.page.html',
  styleUrls: ['./ai-qa.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IonicModule],
  providers: [AiQaGeneratorService],
})
export class AiQaPage implements OnInit {
  protected readonly gen = inject(AiQaGeneratorService);
  private readonly aiBackend = inject(AiBackendService);

  readonly topic = signal('Agentic AI & UI interview questions');
  readonly webSearch = signal(true);
  readonly matchExisting = signal(false);
  readonly rawPromptMode = signal(false);
  readonly rawResponse = signal('');
  readonly showAnswers = signal(false);
  readonly expandedAnswerKeys = signal<ReadonlySet<string>>(new Set<string>());
  readonly collapsedNodeIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly lastDeletedTree = signal<CategoryNode[] | null>(null);
  private undoClearHandle: ReturnType<typeof setTimeout> | null = null;

  readonly allRows = computed(() => flattenCategoryTree(this.gen.tree()));
  readonly visibleRows = computed(() => filterVisibleRows(this.allRows(), this.collapsedNodeIds()));
  readonly totalQCount = computed(() => sumQuestionCounts(this.gen.tree()));

  async ngOnInit(): Promise<void> {
    await this.gen.loadExistingCategories();
  }

  setTopic(v: string | null | undefined): void { this.topic.set(v || ''); }

  generateCategories(): void {
    this.gen.generateCategories(this.topic(), 'vercel-ai-sdk', this.webSearch(), this.matchExisting());
  }

  async sendRawPrompt(): Promise<void> {
    this.rawResponse.set('');
    try {
      const res = await fetch(this.aiBackend.apiUrl('/raw-prompt-stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: this.topic() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        this.rawResponse.set('Error: ' + (err?.error ?? res.statusText));
        return;
      }
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        this.rawResponse.set(text);
      }
      text += dec.decode();
      this.rawResponse.set(text || '(empty response)');
    } catch (e: any) {
      this.rawResponse.set('Error: ' + (e?.message ?? String(e)));
    }
  }

  generateQuestions(): void {
    this.gen.generateQuestions('vercel-ai-sdk', this.webSearch());
    this.expandedAnswerKeys.set(new Set<string>());
  }

  addRootCategory(): void { this.gen.tree.set(addCategoryChild(this.gen.tree())); }

  addChild(parentId: string): void {
    this.gen.tree.set(addCategoryChild(this.gen.tree(), parentId));
  }

  deleteCategory(id: string): void {
    if (this.undoClearHandle !== null) clearTimeout(this.undoClearHandle);
    this.lastDeletedTree.set(cloneCategoryTree(this.gen.tree()));
    this.gen.tree.set(deleteCategoryNode(this.gen.tree(), id));
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
    if (this.undoClearHandle !== null) { clearTimeout(this.undoClearHandle); this.undoClearHandle = null; }
  }

  renameCategory(id: string, title: string): void {
    this.gen.tree.set(updateCategoryNode(this.gen.tree(), id, n => ({ ...n, title })));
  }

  changeCount(id: string, raw: string | number | null | undefined): void {
    const n = Math.max(0, Math.min(50, Number(raw || 0)));
    this.gen.tree.set(updateCategoryNode(this.gen.tree(), id, node => ({
      ...node,
      questionCount: Number.isFinite(n) ? n : 0,
    })));
  }

  collapsed(id: string): boolean { return this.collapsedNodeIds().has(id); }

  toggleCollapsed(id: string): void {
    const s = new Set(this.collapsedNodeIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.collapsedNodeIds.set(s);
  }

  indent(depth: number): string { return `${Math.min(depth, 8) * 18}px`; }

  answerKey(item: QuestionAnswer, i: number): string {
    return `${item.categoryId || item.categoryPath || 'qa'}-${i}`;
  }

  answerVisible(item: QuestionAnswer, i: number): boolean {
    return this.showAnswers() || this.expandedAnswerKeys().has(this.answerKey(item, i));
  }

  toggleAnswer(item: QuestionAnswer, i: number): void {
    const key = this.answerKey(item, i);
    const s = new Set(this.expandedAnswerKeys());
    s.has(key) ? s.delete(key) : s.add(key);
    this.expandedAnswerKeys.set(s);
  }

  async copyQuestions(): Promise<void> {
    const text = this.gen.questions()
      .map((q, i) => [`${i + 1}. ${q.question}`, `A: ${q.answer}`, q.categoryPath ? `Category: ${q.categoryPath}` : ''].filter(Boolean).join('\n'))
      .join('\n\n');
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    this.gen.questionStatus.set(`Copied ${this.gen.questions().length} Q&A`);
  }

  exportJson(): void {
    const blob = new Blob(
      [JSON.stringify({ topic: this.topic(), tree: this.gen.tree(), questions: this.gen.questions() }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'qa.json'; a.click();
    URL.revokeObjectURL(url);
  }

  trackRow(_i: number, row: CategoryTreeRow): string { return row.node.id; }
  trackQ(i: number, item: QuestionAnswer): string { return this.answerKey(item, i); }
}
