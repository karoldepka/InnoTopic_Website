import { Hono } from 'hono';
import { streamObject, generateObject } from 'ai';
import { z } from 'zod';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { loadExistingCategories } from '../existing-categories.js';
import { buildCategoryTreeMessages } from '../prompts.js';
import { textStreamResponse } from '../utils.js';
import type { CategoryTreeRequest } from '../types.js';

export const categoriesRouter = new Hono();

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

  const { textStream } = streamObject({
    model: llm,
    schema: categoryTreeResponseSchema,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'category-tree-stream' },
  });
  return textStreamResponse(textStream);
}

categoriesRouter.post('/category-tree/stream-json', handleCategoryTreeStream);
categoriesRouter.post('/ai-api/category-tree/stream-json', handleCategoryTreeStream);

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
