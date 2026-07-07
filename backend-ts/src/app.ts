import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { categoriesRouter } from './routes/categories.js';
import { qaRouter } from './routes/qa.js';
import { quizRouter } from './routes/quiz.js';
import { copilotRouter } from './routes/copilotkit.js';
import { odmRouter } from './routes/odm.js';
import { transcribeRouter } from './routes/transcribe.js';
import { MODEL_NAME } from './llm.js';

/** The Hono app itself, with no runtime attached - shared by both the local dev server
 * (index.ts, via @hono/node-server's serve()) and the Vercel serverless entry point
 * (../api/index.ts, via hono/vercel's handle()), so route registration only happens once and
 * can't drift between the two ways this backend actually runs. */
export const app = new Hono();

app.use('*', cors({ origin: '*' }));
app.use('*', logger());

app.route('/', categoriesRouter);
app.route('/', qaRouter);
app.route('/', quizRouter);
app.route('/', copilotRouter);
app.route('/', odmRouter);
app.route('/', transcribeRouter);

app.get('/health', c => c.json({ status: 'ok' }));
app.get('/ai-api/health', c => c.json({ status: 'ok' }));
app.get('/ai-api/model', c => c.json({ model: MODEL_NAME }));
