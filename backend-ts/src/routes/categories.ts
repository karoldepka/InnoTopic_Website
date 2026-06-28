import { Hono } from 'hono';
import { streamText, generateObject } from 'ai';
import { z } from 'zod';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { loadExistingCategories } from '../existing-categories.js';
import { buildCategoryTreeMessages, buildMoreSubcategoriesMessages } from '../prompts.js';
import { textStreamResponse, sseData, sseStreamResponse, stripJsonFences } from '../utils.js';
import type { CategoryTreeRequest, MoreSubcategoriesRequest } from '../types.js';

export const categoriesRouter = new Hono();

// ─── Debug: return raw prompt without calling the model ───────────────────────

categoriesRouter.post('/category-tree/debug-prompt', async (c) => {
  const body = await c.req.json<CategoryTreeRequest>();
  const searchResults = body.web_search ? await webSearch(body.message) : [];
  const existingCategories = loadExistingCategories();
  const messages = buildCategoryTreeMessages(body, existingCategories, searchResults);
  return c.json({ model: MODEL_NAME, messages });
});
categoriesRouter.post('/ai-api/category-tree/debug-prompt', async (c) => {
  const body = await c.req.json<CategoryTreeRequest>();
  const searchResults = body.web_search ? await webSearch(body.message) : [];
  const existingCategories = loadExistingCategories();
  const messages = buildCategoryTreeMessages(body, existingCategories, searchResults);
  return c.json({ model: MODEL_NAME, messages });
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
  const searchResults = body.web_search ? await webSearch(body.message) : [];
  const existingCategories = loadExistingCategories();
  const messages = buildCategoryTreeMessages(body, existingCategories, searchResults);

  const { textStream } = streamText({
    model: llm,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'category-tree-stream' },
  });
  return textStreamResponse(stripJsonFences(textStream), c);
}

categoriesRouter.post('/category-tree/stream-json', handleCategoryTreeStream);
categoriesRouter.post('/ai-api/category-tree/stream-json', handleCategoryTreeStream);

// ─── Legacy SSE endpoint (used by copilotkit-react-embed) ─────────────────────
// The React embed calls /category-tree-stream and reads SSE events
// with {type:'delta', delta: chunk} format. This wraps the same stream.

async function handleCategoryTreeStreamSSE(c: import('hono').Context) {
  const body = await c.req.json<CategoryTreeRequest>();
  const searchResults = body.web_search ? await webSearch(body.message) : [];
  const existingCategories = loadExistingCategories();
  const messages = buildCategoryTreeMessages(body, existingCategories, searchResults);

  const { textStream } = streamText({
    model: llm,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'category-tree-stream' },
  });

  async function* gen() {
    for await (const chunk of stripJsonFences(textStream)) {
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
  const searchResults = body.web_search ? await webSearch(body.message) : [];
  const existingCategories = loadExistingCategories();
  const messages = buildCategoryTreeMessages(body, existingCategories, searchResults);

  const { object } = await generateObject({
    model: llm,
    schema: categoryTreeResponseSchema,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'category-tree' },
  });

  return c.json({ ...object, modelName: MODEL_NAME });
}

categoriesRouter.post('/category-tree', handleCategoryTree);
categoriesRouter.post('/ai-api/category-tree', handleCategoryTree);

// ─── Generate more subcategories for a specific parent node ───────────────────

async function handleMoreSubcategories(c: import('hono').Context) {
  const body = await c.req.json<MoreSubcategoriesRequest>();
  const searchResults = body.web_search ? await webSearch(body.topic) : [];
  const messages = buildMoreSubcategoriesMessages(body, searchResults);

  const { textStream } = streamText({
    model: llm,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'more-subcategories' },
  });
  return textStreamResponse(stripJsonFences(textStream), c);
}

categoriesRouter.post('/category-tree/more-children', handleMoreSubcategories);
categoriesRouter.post('/ai-api/category-tree/more-children', handleMoreSubcategories);
