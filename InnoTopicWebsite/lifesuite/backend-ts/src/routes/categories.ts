import { Hono } from 'hono';
import { streamText, generateObject } from 'ai';
import { z } from 'zod';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { loadExistingCategories } from '../existing-categories.js';
import { buildCategoryTreeMessages, buildMoreSubcategoriesMessages } from '../prompts.js';
import { textStreamResponse, sseData, sseStreamResponse, stripJsonFences } from '../utils.js';
import { logLanguageModelCost, logStreamLanguageModelCost } from '../ai-cost.js';
import type { CategoryTreeRequest, MoreSubcategoriesRequest } from '../types.js';

export const categoriesRouter = new Hono();

// GH #130: directory-mode requests carry an optional (possibly empty) guidance message instead of
// a required topic string - fall back to the directory name so web search still has something
// sensible to search for.
function resolveSearchQuery(body: CategoryTreeRequest): string {
  return body.fileTree ? (body.message?.trim() || body.fileTree.rootName) : body.message;
}

function categoryRequestLogDetails(body: CategoryTreeRequest) {
  return {
    topicLength: body.message?.length ?? 0,
    existingRootCount: body.tree?.length ?? 0,
    webSearch: Boolean(body.web_search),
    matchExisting: Boolean(body.match_existing),
    isRefinement: Boolean(body.isRefinement),
    fileTreeEntryCount: body.fileTree?.entries.length ?? 0,
    model: MODEL_NAME,
  };
}

async function* logCategoryStream(stream: ReadableStream<string>, startedAt: number): AsyncGenerator<string> {
  let chunkCount = 0;
  let characterCount = 0;
  try {
    for await (const chunk of stripJsonFences(stream)) {
      chunkCount++;
      characterCount += chunk.length;
      if (chunkCount === 1) {
        console.info('[category-tree] First stream chunk', { durationMs: Date.now() - startedAt });
      }
      yield chunk;
    }
  } catch (error) {
    console.error('[category-tree] Stream failed', { durationMs: Date.now() - startedAt, error });
    throw error;
  } finally {
    console.info('[category-tree] Stream completed', {
      durationMs: Date.now() - startedAt,
      chunkCount,
      characterCount,
    });
  }
}

// ─── Debug: return raw prompt without calling the model ───────────────────────

categoriesRouter.post('/category-tree/debug-prompt', async (c) => {
  const body = await c.req.json<CategoryTreeRequest>();
  const searchResults = body.web_search ? await webSearch(resolveSearchQuery(body)) : [];
  const existingCategories = loadExistingCategories();
  const prompt = buildCategoryTreeMessages(body, existingCategories, searchResults);
  return c.json({ model: MODEL_NAME, ...prompt });
});
categoriesRouter.post('/ai-api/category-tree/debug-prompt', async (c) => {
  const body = await c.req.json<CategoryTreeRequest>();
  const searchResults = body.web_search ? await webSearch(resolveSearchQuery(body)) : [];
  const existingCategories = loadExistingCategories();
  const prompt = buildCategoryTreeMessages(body, existingCategories, searchResults);
  return c.json({ model: MODEL_NAME, ...prompt });
});

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const categoryNodeSchema: z.ZodType<any> = z.lazy(() => z.object({
  id: z.string(),
  title: z.string(),
  questionCount: z.number(),
  children: z.array(categoryNodeSchema),
  matchedExistingCategoryId: z.string().nullable().optional(),
  matchedExistingCategoryTitle: z.string().nullable().optional(),
  isExistingCategory: z.boolean().optional(),
}));

const categoryTreeResponseSchema = z.object({
  tree: z.array(categoryNodeSchema),
  assistantMessage: z.string().optional(),
});

// ─── Existing categories ───────────────────────────────────────────────────────

function handleExistingCategories(c: import('hono').Context) {
  const categories = loadExistingCategories();
  return c.json({ categories });
}

categoriesRouter.get('/categories/existing', handleExistingCategories);
categoriesRouter.get('/ai-api/categories/existing', handleExistingCategories);

// ─── Streaming category tree (used by the Angular frontend) ───────────────────

async function handleCategoryTreeStream(c: import('hono').Context) {
  const body = await c.req.json<CategoryTreeRequest>();
  const startedAt = Date.now();
  console.info('[category-tree] Stream request received', categoryRequestLogDetails(body));
  const searchResults = body.web_search ? await webSearch(resolveSearchQuery(body)) : [];
  console.info('[category-tree] Search enrichment resolved', {
    durationMs: Date.now() - startedAt,
    resultCount: searchResults.length,
  });
  const existingCategories = loadExistingCategories();
  const { system, messages } = buildCategoryTreeMessages(body, existingCategories, searchResults);

  const result = streamText({
    model: llm,
    system,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'category-tree-stream' },
  });
  logStreamLanguageModelCost('category-tree-stream', MODEL_NAME, result.usage);
  return textStreamResponse(logCategoryStream(result.textStream, startedAt), c);
}

categoriesRouter.post('/category-tree/stream-json', handleCategoryTreeStream);
categoriesRouter.post('/ai-api/category-tree/stream-json', handleCategoryTreeStream);

// ─── Legacy SSE endpoint (used by copilotkit-react-embed) ─────────────────────
// The React embed calls /category-tree-stream and reads SSE events
// with {type:'delta', delta: chunk} format. This wraps the same stream.

async function handleCategoryTreeStreamSSE(c: import('hono').Context) {
  const body = await c.req.json<CategoryTreeRequest>();
  const searchResults = body.web_search ? await webSearch(resolveSearchQuery(body)) : [];
  const existingCategories = loadExistingCategories();
  const { system, messages } = buildCategoryTreeMessages(body, existingCategories, searchResults);

  const result = streamText({
    model: llm,
    system,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'category-tree-stream' },
  });
  logStreamLanguageModelCost('category-tree-stream-sse', MODEL_NAME, result.usage);

  async function* gen() {
    for await (const chunk of stripJsonFences(result.textStream)) {
      yield sseData({ type: 'delta', delta: chunk });
    }
  }

  return sseStreamResponse(gen());
}

categoriesRouter.post('/category-tree-stream', handleCategoryTreeStreamSSE);
categoriesRouter.post('/ai-api/category-tree-stream', handleCategoryTreeStreamSSE);

// ─── Non-streaming category tree (kept for compatibility) ─────────────────────

async function handleCategoryTree(c: import('hono').Context) {
  const body = await c.req.json<CategoryTreeRequest>();
  const startedAt = Date.now();
  console.info('[category-tree] Fallback request received', categoryRequestLogDetails(body));
  const searchResults = body.web_search ? await webSearch(resolveSearchQuery(body)) : [];
  const existingCategories = loadExistingCategories();
  const { system, messages } = buildCategoryTreeMessages(body, existingCategories, searchResults);

  // AI SDK's model/schema generics exceed TypeScript's instantiation depth in this workspace.
  // Keep that complexity at the SDK boundary; the response is still runtime-validated by Zod.
  const result = await (generateObject as any)({
    model: llm,
    schema: categoryTreeResponseSchema,
    system,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'category-tree' },
  });
  logLanguageModelCost('category-tree', MODEL_NAME, result.usage);

  console.info('[category-tree] Fallback request completed', {
    durationMs: Date.now() - startedAt,
    generatedRootCount: result.object.tree?.length ?? 0,
  });
  return c.json({ ...result.object, modelName: MODEL_NAME });
}

categoriesRouter.post('/category-tree', handleCategoryTree);
categoriesRouter.post('/ai-api/category-tree', handleCategoryTree);

// ─── Generate more subcategories for a specific parent node ───────────────────

async function handleMoreSubcategories(c: import('hono').Context) {
  const body = await c.req.json<MoreSubcategoriesRequest>();
  const searchResults = body.web_search ? await webSearch(body.topic) : [];
  const { system, messages } = buildMoreSubcategoriesMessages(body, searchResults);

  const result = streamText({
    model: llm,
    system,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'more-subcategories' },
  });
  logStreamLanguageModelCost('more-subcategories', MODEL_NAME, result.usage);
  return textStreamResponse(stripJsonFences(result.textStream), c);
}

categoriesRouter.post('/category-tree/more-children', handleMoreSubcategories);
categoriesRouter.post('/ai-api/category-tree/more-children', handleMoreSubcategories);
