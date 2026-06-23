import { Hono } from 'hono';
import { streamText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { loadExistingCategories } from '../existing-categories.js';
import { buildCategoryTreeMessages } from '../prompts.js';
import { stripJsonFences, textStreamResponse } from '../utils.js';
import type { CategoryTreeRequest } from '../types.js';

export const categoriesRouter = new Hono();

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

  const { textStream } = streamText({ model: llm, messages });
  return textStreamResponse(stripJsonFences(textStream));
}

categoriesRouter.post('/category-tree/stream-json', handleCategoryTreeStream);
categoriesRouter.post('/ai-api/category-tree/stream-json', handleCategoryTreeStream);

// ─── Non-streaming category tree (kept for compatibility) ─────────────────────

async function handleCategoryTree(c: import('hono').Context) {
  const body = await c.req.json<CategoryTreeRequest>();
  const searchResults = body.web_search ? await webSearch(body.message) : [];
  const existingCategories = loadExistingCategories();
  const messages = buildCategoryTreeMessages(body, existingCategories, searchResults);

  const { textStream } = streamText({ model: llm, messages });
  const chunks: string[] = [];
  for await (const chunk of textStream as AsyncIterable<string>) {
    chunks.push(chunk);
  }
  const raw = chunks.join('');

  let parsed: unknown;
  try {
    // Strip fences then parse
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    parsed = jsonStart >= 0 && jsonEnd > jsonStart
      ? JSON.parse(raw.slice(jsonStart, jsonEnd + 1))
      : JSON.parse(raw);
  } catch {
    return c.json({ error: 'Failed to parse LLM response', raw }, 500);
  }

  return c.json({ ...(parsed as object), modelName: MODEL_NAME });
}

categoriesRouter.post('/category-tree', handleCategoryTree);
categoriesRouter.post('/ai-api/category-tree', handleCategoryTree);
