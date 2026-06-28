import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';

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
import { QaDraftStore } from '../shared/qa-draft.store';
import { CategoryTreeRow } from '../shared/ai-qa-tree.utils';

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
  private readonly draftStore = inject(QaDraftStore);
  private readonly alertCtrl = inject(AlertController);

  readonly topic = signal('Agentic AI & UI interview questions');
  readonly webSearch = signal(true);
  readonly matchExisting = signal(false);
  readonly rawPromptMode = signal(false);
  readonly rawResponse = signal('');
  readonly showAnswers = signal(false);
  readonly expandedAnswerKeys = signal<ReadonlySet<string>>(new Set<string>());
  readonly selectedQIndices = signal<ReadonlySet<number>>(new Set<number>());
  readonly allQSelected = computed(() =>
    this.gen.questions().length > 0 && this.selectedQIndices().size === this.gen.questions().length
  );
  readonly collapsedNodeIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly lastDeletedTree = signal<CategoryNode[] | null>(null);
  private undoClearHandle: ReturnType<typeof setTimeout> | null = null;

  readonly allRows = computed(() => flattenCategoryTree(this.gen.tree()));
  readonly visibleRows = computed(() => filterVisibleRows(this.allRows(), this.collapsedNodeIds()));
  readonly totalQCount = computed(() => sumQuestionCounts(this.gen.tree()));

  constructor() {
    // Auto-save draft to IndexedDB whenever tree or questions change.
    // The ?? check prevents overwriting a real draft with the empty initial state.
    effect(() => {
      const tree = this.gen.tree();
      const questions = this.gen.questions();
      if (!tree.length && !questions.length) return;
      void this.draftStore.save({
        topic: this.topic(),
        tree,
        questions,
        savedAt: Date.now(),
      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.gen.loadExistingCategories();
    try {
      const draft = await this.draftStore.load();
      if (draft) {
        if (draft.topic) this.topic.set(draft.topic);
        this.gen.restoreFromDraft(draft.tree, draft.questions);
      }
    } catch (e) {
      console.warn('[draft] Failed to restore draft:', e);
    }
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
    this.selectedQIndices.set(new Set<number>());
  }

  async showMoreQADialog(): Promise<void> {
    const totalQ = this.gen.questions().length;
    const alert = await this.alertCtrl.create({
      header: 'Generate More Q&A',
      message: `Currently ${totalQ} question${totalQ === 1 ? '' : 's'}. How many more would you like?`,
      inputs: [{ name: 'count', type: 'number', placeholder: '10', value: '10', min: 1, max: 200 }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Generate',
          handler: (data) => {
            const n = Math.max(1, Math.min(200, parseInt(data.count) || 10));
            this.gen.generateMoreQuestions('vercel-ai-sdk', this.webSearch(), n);
          },
        },
      ],
    });
    await alert.present();
  }

  async showMoreSubcategoriesDialog(row: CategoryTreeRow): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: `Subcategories for "${row.node.title}"`,
      inputs: [{ name: 'count', type: 'number', placeholder: '5', value: '5', min: 1, max: 20 }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Generate',
          handler: (data) => {
            const n = Math.max(1, Math.min(20, parseInt(data.count) || 5));
            this.gen.generateSubcategories(row.node.id, this.topic(), n, this.webSearch());
          },
        },
      ],
    });
    await alert.present();
  }

  toggleQSelected(i: number): void {
    const s = new Set(this.selectedQIndices());
    s.has(i) ? s.delete(i) : s.add(i);
    this.selectedQIndices.set(s);
  }

  toggleSelectAll(): void {
    this.selectedQIndices.set(
      this.selectedQIndices().size === this.gen.questions().length
        ? new Set<number>()
        : new Set(this.gen.questions().map((_, i) => i))
    );
  }

  approveSelected(): void {
    this.gen.approveQuestions(this.selectedQIndices());
    this.selectedQIndices.set(new Set<number>());
  }

  rejectSelected(): void {
    this.gen.rejectQuestions(this.selectedQIndices());
    this.selectedQIndices.set(new Set<number>());
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
    const now = Date.now();
    this.gen.tree.set(updateCategoryNode(this.gen.tree(), id, n => ({ ...n, title, contentModifiedAt: now })));
  }

  changeCount(id: string, raw: string | number | null | undefined): void {
    const n = Math.max(0, Math.min(50, Number(raw || 0)));
    const now = Date.now();
    this.gen.tree.set(updateCategoryNode(this.gen.tree(), id, node => ({
      ...node,
      questionCount: Number.isFinite(n) ? n : 0,
      contentModifiedAt: now,
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
