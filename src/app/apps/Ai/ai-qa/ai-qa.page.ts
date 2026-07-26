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
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import {presentDismissableToast} from '../../../libs/AppFedShared/utils/toast-utils';
import {
  ColumnDef,
  ExpandedState,
  Row,
  createAngularTable,
  getCoreRowModel,
  getExpandedRowModel,
} from '@tanstack/angular-table';

import { AiBackendService, CategoryNode, QuestionAnswer } from '../../Learn/core/ai-backend.service';
import {
  addCategoryChild,
  cloneCategoryTree,
  deleteCategoryNode,
  sumQuestionCounts,
  updateCategoryNode,
} from '../shared/ai-qa-tree.utils';
import { AiQaGeneratorService } from '../shared/ai-qa-generator.service';
import { QaDraftStore } from '../shared/qa-draft.store';
import { LearnItemItemsService } from '../../Learn/core/learn-item-items.service';
import { LearnItem } from '../../Learn/models/LearnItem';
import { LearnItem$ } from '../../Learn/models/LearnItem$';
import { OdmBackend } from '../../../libs/AppFedShared/odm/OdmBackend';
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';

@Component({
  selector: 'app-ai-qa',
  templateUrl: './ai-qa.page.html',
  styleUrls: ['./ai-qa.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IonicModule, AppLogoComponent],
  providers: [AiQaGeneratorService],
})
export class AiQaPage implements OnInit {
  protected readonly gen = inject(AiQaGeneratorService);
  private readonly aiBackend = inject(AiBackendService);
  private readonly draftStore = inject(QaDraftStore);
  private readonly alertCtrl = inject(AlertController);
  private readonly learnItems = inject(LearnItemItemsService);
  private readonly toastCtrl = inject(ToastController);

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
  readonly lastDeletedTree = signal<CategoryNode[] | null>(null);
  readonly categoryExpanded = signal<ExpandedState>(true);
  private readonly categoryColumns: ColumnDef<CategoryNode>[] = [
    { id: 'category', accessorKey: 'title' },
  ];
  readonly categoryTable = createAngularTable<CategoryNode>(() => ({
    data: this.gen.tree(),
    columns: this.categoryColumns,
    state: { expanded: this.categoryExpanded() },
    onExpandedChange: (updater) => {
      this.categoryExpanded.set(
        typeof updater === 'function' ? updater(this.categoryExpanded()) : updater,
      );
    },
    getSubRows: (row) => row.children,
    getRowId: (row) => row.id,
    enableExpanding: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  }));
  readonly totalQCount = computed(() => sumQuestionCounts(this.gen.tree()));
  private undoClearHandle: ReturnType<typeof setTimeout> | null = null;
  private lastQuestionCount = 0;

  constructor() {
    // Auto-save draft to IndexedDB whenever tree or questions change.
    effect(() => {
      const tree = this.gen.tree();
      const questions = this.gen.questions();
      if (!tree.length && !questions.length) return;
      void this.draftStore.save({ topic: this.topic(), tree, questions, savedAt: Date.now() });
    });

    // Check (select) questions by default as they appear — whether streamed in,
    // generated, or restored from a draft — while preserving any manual unchecks.
    effect(() => {
      const count = this.gen.questions().length;
      const prev = this.lastQuestionCount;
      if (count > prev) {
        const sel = new Set(this.selectedQIndices());
        for (let i = prev; i < count; i++) sel.add(i);
        this.selectedQIndices.set(sel);
      } else if (count < prev) {
        this.selectedQIndices.set(new Set([...this.selectedQIndices()].filter(i => i < count)));
      }
      this.lastQuestionCount = count;
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

  async showMoreSubcategoriesDialog(node: CategoryNode): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: `Subcategories for "${node.title}"`,
      inputs: [{ name: 'count', type: 'number', placeholder: '5', value: '5', min: 1, max: 20 }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Generate',
          handler: (data) => {
            const n = Math.max(1, Math.min(20, parseInt(data.count) || 5));
            this.gen.generateSubcategories(node.id, this.topic(), n, this.webSearch());
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

  async approveSelected(): Promise<void> {
    const selected = this.selectedQIndices();
    const approved = this.gen.questions().filter((_, i) => selected.has(i));
    if (!approved.length) return;
    this.persistQuestionsAsDrafts(approved);
    // The approved Q&A are now saved as Learn drafts — remove them from the pending list.
    this.gen.questions.set(this.gen.questions().filter((_, i) => !selected.has(i)));
    this.selectedQIndices.set(new Set<number>());
    await presentDismissableToast(this.toastCtrl, {
      message: `Approved ${approved.length} Q&A → saved to Learn as AI drafts.`,
      duration: 2500,
      position: 'bottom',
      color: 'success',
    });
  }

  /** Persist Q&A into the Learn store as AI-created drafts (whenGeneratedByAi + draftedAt),
   * using LearnItem$ and tagging each with its category path. */
  private persistQuestionsAsDrafts(questions: QuestionAnswer[]): void {
    const now = OdmBackend.nowTimestamp();
    for (const qa of questions) {
      const data: Partial<LearnItem> = {
        title: qa.question,
        answer: this.answerHtmlWithImage(qa),
        categories: qa.categoryPath || qa.categoryId,
        whenGeneratedByAi: now,
        draftedAt: now,
      };
      this.learnItems.add(Object.assign(new LearnItem(), data));
    }
  }

  /** Appends the (optional, on-demand-generated) illustration as a plain `<img>` tag onto the
   * answer's HTML - LearnItem.answer is already an HtmlString rendered via the same rich-text
   * pipeline used elsewhere, and that pipeline (RichTextEditComponent.convertInlineImagesToBlobs)
   * already knows how to offload an inline `data:` image to proper blob storage the next time
   * this item is opened for editing, so this doesn't need its own upload step here. */
  private answerHtmlWithImage(qa: QuestionAnswer): string {
    const answer = qa.answer ?? '';
    return qa.imageDataUrl ? `${answer}<p><img src="${qa.imageDataUrl}" alt=""></p>` : answer;
  }

  rejectSelected(): void {
    this.gen.rejectQuestions(this.selectedQIndices());
    this.selectedQIndices.set(new Set<number>());
  }

  /** Persist the generated categories + Q&A into the Learn store as AI drafts,
   * using the unified OdmItem$2 tree model (createChild => parentIds + orderNum + save).
   * Categories are saved with isCategory=true so they show in /learn but are excluded
   * from the quiz; every saved item is stamped draftedByAIAt + draftedAt. */
  async saveToLearn(): Promise<void> {
    const now = OdmBackend.nowTimestamp();
    const categoryIdToItem = new Map<string, LearnItem$>();

    const saveCategory = (node: CategoryNode, parentItem: LearnItem$ | undefined): void => {
      const data: Partial<LearnItem> = {
        title: node.title,
        isCategory: true,
        whenGeneratedByAi: now,
        draftedAt: now,
      };
      const item = parentItem
        ? parentItem.createChild(data)
        : this.learnItems.add(Object.assign(new LearnItem(), data));
      categoryIdToItem.set(node.id, item);
      for (const child of node.children ?? []) {
        saveCategory(child, item);
      }
    };
    for (const root of this.gen.tree()) {
      saveCategory(root, undefined);
    }

    let qaCount = 0;
    for (const qa of this.gen.questions()) {
      const data: Partial<LearnItem> = {
        title: qa.question,
        answer: this.answerHtmlWithImage(qa),
        whenGeneratedByAi: now,
        draftedAt: now,
      };
      const categoryItem = categoryIdToItem.get(qa.categoryId);
      if (categoryItem) {
        categoryItem.createChild(data);
      } else {
        this.learnItems.add(Object.assign(new LearnItem(), data));
      }
      qaCount++;
    }

    await presentDismissableToast(this.toastCtrl, {
      message: `Saved ${categoryIdToItem.size} categories and ${qaCount} Q&A to Learn (as AI drafts).`,
      duration: 2500,
      position: 'bottom',
      color: 'success',
    });
  }

  addRootCategory(): void { this.gen.tree.set(addCategoryChild(this.gen.tree())); }

  /** Hierarchical ordinal for a category row, e.g. "1", "1.2", "1.2.1". */
  categoryOrdinal(row: Row<CategoryNode>): string {
    return [...row.getParentRows(), row].map(r => r.index + 1).join('.');
  }

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

  trackQ(i: number, item: QuestionAnswer): string { return this.answerKey(item, i); }
}
