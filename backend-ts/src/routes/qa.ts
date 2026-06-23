import { Hono } from 'hono';
import { streamText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { buildQAMessages } from '../prompts.js';
import { stripJsonFences, textStreamResponse } from '../utils.js';
import type { QuestionAnswerRequest } from '../types.js';

export const qaRouter = new Hono();

// ─── Streaming Q&A (used by the Angular frontend) ─────────────────────────────

async function handleQAStream(c: import('hono').Context) {
  const body = await c.req.json<QuestionAnswerRequest>();
  const query = (body.tree ?? []).map(n => n.title).join(' ');
  const searchResults = body.web_search ? await webSearch(query) : [];
  const messages = buildQAMessages(body, searchResults);

  const { textStream } = streamText({ model: llm, messages });
  return textStreamResponse(stripJsonFences(textStream));
}

qaRouter.post('/category-tree/questions/stream-json', handleQAStream);
qaRouter.post('/ai-api/category-tree/questions/stream-json', handleQAStream);

// ─── Non-streaming Q&A ────────────────────────────────────────────────────────

async function handleQA(c: import('hono').Context) {
  const body = await c.req.json<QuestionAnswerRequest>();
  const query = (body.tree ?? []).map(n => n.title).join(' ');
  const searchResults = body.web_search ? await webSearch(query) : [];
  const messages = buildQAMessages(body, searchResults);

  const { textStream } = streamText({ model: llm, messages });
  const chunks: string[] = [];
  for await (const chunk of textStream as AsyncIterable<string>) {
    chunks.push(chunk);
  }
  const raw = chunks.join('');

  let parsed: unknown;
  try {
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

qaRouter.post('/category-tree/questions', handleQA);
qaRouter.post('/ai-api/category-tree/questions', handleQA);
