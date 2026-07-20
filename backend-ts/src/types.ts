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

export interface CategoryTreeRequest {
  message: string;
  tree: CategoryNode[];
  web_search?: boolean;
  match_existing?: boolean;
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
  existingQuestions?: string[];
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
