import { Hono } from 'hono';
import { streamText, generateObject } from 'ai';
import { z } from 'zod';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { buildQAMessages } from '../prompts.js';
import { textStreamResponse, stripJsonFences } from '../utils.js';
import type { QuestionAnswerRequest } from '../types.js';

export const qaRouter = new Hono();

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const questionAnswerSchema = z.object({
  categoryId: z.string(),
  categoryPath: z.string(),
  question: z.string(),
  answer: z.string(),
});

const questionAnswerResponseSchema = z.object({
  items: z.array(questionAnswerSchema),
  modelName: z.string().optional(),
});

// ─── Streaming Q&A (used by the Angular frontend) ─────────────────────────────

async function handleQAStream(c: import('hono').Context) {
  const body = await c.req.json<QuestionAnswerRequest>();
  const query = (body.tree ?? []).map(n => n.title).join(' ');
  const searchResults = body.web_search ? await webSearch(query) : [];
  const messages = buildQAMessages(body, searchResults);

  const { textStream, text } = streamText({
    model: llm,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'qa-stream' },
  });
  text.then(t => console.log('[qa] raw model output (first 500):', t.slice(0, 500)));
  return textStreamResponse(stripJsonFences(textStream), c);
}

qaRouter.post('/category-tree/questions/stream-json', handleQAStream);
qaRouter.post('/ai-api/category-tree/questions/stream-json', handleQAStream);

// ─── Non-streaming Q&A ────────────────────────────────────────────────────────

async function handleQA(c: import('hono').Context) {
  const body = await c.req.json<QuestionAnswerRequest>();
  const query = (body.tree ?? []).map(n => n.title).join(' ');
  const searchResults = body.web_search ? await webSearch(query) : [];
  const messages = buildQAMessages(body, searchResults);

  const { object } = await generateObject({
    model: llm,
    schema: questionAnswerResponseSchema,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'qa' },
  });

  return c.json({ ...object, modelName: MODEL_NAME });
}

qaRouter.post('/category-tree/questions', handleQA);
qaRouter.post('/ai-api/category-tree/questions', handleQA);
