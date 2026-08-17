import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { categoriesRouter } from './routes/categories.js';
import { qaRouter } from './routes/qa.js';
import { qaImageRouter } from './routes/qa-image.js';
import { quizRouter } from './routes/quiz.js';
import { copilotRouter } from './routes/copilotkit.js';
import { odmRouter } from './routes/odm.js';
import { odmMongoRouter } from './routes/odm-mongo.js';
import { transcribeRouter } from './routes/transcribe.js';
import { journalAdviceRouter } from './routes/journal-advice.js';
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
app.route('/', qaImageRouter);
app.route('/', quizRouter);
app.route('/', copilotRouter);
app.route('/', odmRouter);
app.route('/', odmMongoRouter);
app.route('/', transcribeRouter);
app.route('/', journalAdviceRouter);

app.get('/health', c => c.json({ status: 'ok' }));
app.get('/ai-api/health', c => c.json({ status: 'ok' }));
app.get('/ai-api/model', c => c.json({ model: MODEL_NAME }));

/** Vercel's zero-config Hono support (docs: vercel.com/docs/frameworks/backend/hono) looks for a
 * default export of the app itself at src/app.ts (among other conventional paths) and turns it
 * into a Vercel Function directly - no hono/vercel handle() adapter needed. That adapter is what
 * api/index.ts used to use, and it's incompatible with Vercel's current Node runtime request shape
 * (throws `this.raw.headers.get is not a function`), so api/index.ts has been removed in favor of
 * this. */
export default app;
