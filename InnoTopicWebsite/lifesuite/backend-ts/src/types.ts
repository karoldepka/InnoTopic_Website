export interface CategoryNode {
  id: string;
  title: string;
  questionCount: number;
  children: CategoryNode[];
  matchedExistingCategoryId?: string | null;
  matchedExistingCategoryTitle?: string | null;
  isExistingCategory?: boolean;
}

export interface ExistingCategory {
  id: string;
  title: string;
  path?: string | null;
  aliases: string[];
}

/** GH #130: a user-picked local directory read entirely in the browser (File System Access API) -
 * `content` is only present for files that were actually read (text/code extensions, under the
 * frontend's size caps); everything else (binary files, oversized files, directories themselves)
 * is still listed so the model can see the full layout even where it can't see file contents. */
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
  /** True for chat-based refinement of the existing tree (rename/merge/split/etc.) as opposed to
   * generating a new tree for `message` as a topic - set explicitly by the caller (which already
   * knows unambiguously which one it's doing) rather than inferred from the message text, since
   * asking the model to guess intent from phrasing proved unreliable in practice (it kept
   * generating a whole new broad tree, and even put the edit instruction itself into a node
   * title, despite prompt wording asking it not to - see buildCategoryTreeMessages). */
  isRefinement?: boolean;
}

export interface QuestionAnswer {
  categoryId: string;
  categoryPath: string;
  question: string;
  answer: string;
}

export interface QuestionAnswerRequest {
  tree: CategoryNode[];
  web_search?: boolean;
  abcd_answers?: boolean;
  existingQuestions?: string[];
  fileTree?: FileTreeRequest;
}

export interface MoreSubcategoriesRequest {
  parentId: string;
  parentTitle: string;
  parentPath: string;
  topic: string;
  existingChildTitles: string[];
  count: number;
  web_search?: boolean;
}

export interface AgUiMessage {
  id?: string;
  role: string;
  content: unknown;
}

export interface AgUiRunInput {
  threadId: string;
  runId: string;
  state?: unknown;
  messages: AgUiMessage[];
  tools?: unknown[];
  context?: unknown[];
  forwardedProps?: unknown;
}

export interface OdmSaveRequest {
  owner: string;
  data: Record<string, unknown>;
  parentIds: string[];
  ancestorIds: string[];
  storeVersionHistory?: boolean;
  /** Plain text to index for semantic search. Omit to leave an existing embedding unchanged. */
  embeddingText?: string;
}

export interface OdmDeleteRequest {
  owner: string;
}

export interface OdmSearchRequest {
  owner: string;
  query: string;
  collection?: string;
  limit?: number;
  minSimilarity?: number;
}

export interface EmbeddingRequest {
  text: string;
}

export interface EmbeddingBatchRequest {
  texts: string[];
}
