import { Hono } from 'hono';
import { streamText, generateObject } from 'ai';
import { z } from 'zod';
import postgres from 'postgres';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { buildQAMessages } from '../prompts.js';
import { textStreamResponse, stripJsonFences } from '../utils.js';
import { logLanguageModelCost, logStreamLanguageModelCost } from '../ai-cost.js';
import type { QuestionAnswerRequest } from '../types.js';

export const qaRouter = new Hono();

// ─── Database setup ───────────────────────────────────────────────────────────

let _sql: ReturnType<typeof postgres> | null = null;

function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    const url = process.env['ODM_DATABASE_URL'] ?? process.env['DATABASE_URL'];
    if (!url) throw new Error('ODM_DATABASE_URL not configured');
    _sql = postgres(url, { ssl: { rejectUnauthorized: false } });
  }
  return _sql;
}

async function ensureAbcdQuestionsTables() {
  if (!process.env['ODM_ENSURE_TABLES']) return;
  const sql = getSql();
  await sql`
    create table if not exists public.abcd_questions (
      id text primary key,
      category_id text not null,
      category_path text not null,
      question text not null,
      answers jsonb not null,
      owner text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      deleted_at timestamptz
    )
  `;
  await sql`
    create index if not exists abcd_questions_category_idx
      on public.abcd_questions (category_id, created_at desc)
      where deleted_at is null
  `;
  await sql`
    create index if not exists abcd_questions_owner_idx
      on public.abcd_questions (owner, created_at desc)
      where deleted_at is null
  `;
}

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
  const { system, messages } = buildQAMessages(body, searchResults);

  const result = streamText({
    model: llm,
    system,
    messages,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'qa-stream' },
    onFinish: ({ text }) => console.log('[qa] raw model output (first 500):', text.slice(0, 500)),
  });
  logStreamLanguageModelCost('qa-stream', MODEL_NAME, result.usage);
  return textStreamResponse(stripJsonFences(result.textStream), c);
}

qaRouter.post('/category-tree/questions/stream-json', handleQAStream);
qaRouter.post('/ai-api/category-tree/questions/stream-json', handleQAStream);

// ─── Non-streaming Q&A ────────────────────────────────────────────────────────

async function handleQA(c: import('hono').Context) {
  const body = await c.req.json<QuestionAnswerRequest>();
  const query = (body.tree ?? []).map(n => n.title).join(' ');
  const searchResults = body.web_search ? await webSearch(query) : [];
  const { system, messages } = buildQAMessages(body, searchResults);

  // AI SDK's model/schema generics exceed TypeScript's instantiation depth in this workspace.
  // Keep that complexity at the SDK boundary; the response is still runtime-validated by Zod.
  const result = await (generateObject as any)({
    model: llm,
    schema: questionAnswerResponseSchema,
    system,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'qa' },
  });
  logLanguageModelCost('qa', MODEL_NAME, result.usage);

  return c.json({ ...result.object, modelName: MODEL_NAME });
}

qaRouter.post('/category-tree/questions', handleQA);
qaRouter.post('/ai-api/category-tree/questions', handleQA);

// ─── ABCD Questions Database Storage ──────────────────────────────────────────

const abcdQuestionSchema = z.object({
  categoryId: z.string(),
  categoryPath: z.string(),
  question: z.string(),
  answers: z.array(z.object({
    id: z.string(),
    label: z.string(),
    text: z.string(),
    correct: z.boolean(),
  })),
});

type AbcdQuestion = z.infer<typeof abcdQuestionSchema>;

async function handleSaveAbcdQuestions(c: import('hono').Context) {
  const body = await c.req.json<{ questions: AbcdQuestion[]; categoryId?: string; categoryPath?: string; owner?: string }>();
  const { questions, categoryId, owner = 'system' } = body;

  if (!Array.isArray(questions) || !questions.length) {
    return c.json({ error: 'questions array required and must not be empty' }, 400);
  }

  // Validate questions format
  try {
    questions.forEach(q => abcdQuestionSchema.parse(q));
  } catch (error) {
    return c.json({ error: 'Invalid question format', details: String(error) }, 400);
  }

  await ensureAbcdQuestionsTables();
  const sql = getSql();

  try {
    const savedQuestions = [];
    for (const question of questions) {
      const id = `abcd_${question.categoryId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await sql`
        insert into public.abcd_questions
          (id, category_id, category_path, question, answers, owner, created_at, updated_at)
        values (
          ${id},
          ${question.categoryId},
          ${question.categoryPath},
          ${question.question},
          ${sql.json(question.answers)},
          ${owner},
          now(),
          now()
        )
      `;
      savedQuestions.push({ id, ...question });
    }
    return c.json({ success: true, saved: savedQuestions.length, questions: savedQuestions });
  } catch (error) {
    console.error('[abcd-questions] Save error:', error);
    return c.json({ error: 'Failed to save questions', details: String(error) }, 500);
  }
}

async function handleFetchAbcdQuestions(c: import('hono').Context) {
  const categoryId = c.req.query('categoryId');
  const owner = c.req.query('owner');
  const limitStr = c.req.query('limit');
  const limit = limitStr ? Math.min(parseInt(limitStr, 10), 1000) : 100;

  await ensureAbcdQuestionsTables();
  const sql = getSql();

  try {
    let query = sql`
      select id, category_id, category_path, question, answers, owner, created_at, updated_at
      from public.abcd_questions
      where deleted_at is null
    `;

    if (categoryId) {
      query = sql`
        select id, category_id, category_path, question, answers, owner, created_at, updated_at
        from public.abcd_questions
        where category_id = ${categoryId} and deleted_at is null
      `;
    } else if (owner) {
      query = sql`
        select id, category_id, category_path, question, answers, owner, created_at, updated_at
        from public.abcd_questions
        where owner = ${owner} and deleted_at is null
      `;
    }

    const rows = await sql`
      ${query}
      order by created_at desc
      limit ${limit}
    `;

    const items = rows.map(row => ({
      id: row['id'],
      categoryId: row['category_id'],
      categoryPath: row['category_path'],
      question: row['question'],
      answers: row['answers'],
      owner: row['owner'],
      createdAt: row['created_at']?.toISOString(),
      updatedAt: row['updated_at']?.toISOString(),
    }));

    return c.json({ items, count: items.length });
  } catch (error) {
    console.error('[abcd-questions] Fetch error:', error);
    return c.json({ error: 'Failed to fetch questions', details: String(error) }, 500);
  }
}

qaRouter.post('/ai-api/abcd-questions/save', handleSaveAbcdQuestions);
qaRouter.get('/ai-api/abcd-questions/fetch', handleFetchAbcdQuestions);
