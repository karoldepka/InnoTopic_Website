import './instrumentation.js';
import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { categoriesRouter } from './routes/categories.js';
import { qaRouter } from './routes/qa.js';
import { quizRouter } from './routes/quiz.js';
import { copilotRouter } from './routes/copilotkit.js';
import { odmRouter } from './routes/odm.js';
import { MODEL_NAME } from './llm.js';

const app = new Hono();

app.use('*', cors({ origin: '*' }));
app.use('*', logger());

app.route('/', categoriesRouter);
app.route('/', qaRouter);
app.route('/', quizRouter);
app.route('/', copilotRouter);
app.route('/', odmRouter);

app.get('/health', c => c.json({ status: 'ok' }));
app.get('/ai-api/health', c => c.json({ status: 'ok' }));
app.get('/ai-api/model', c => c.json({ model: MODEL_NAME }));

const port = parseInt(process.env['PORT'] ?? '8000', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`LifeSuite AI backend (TS) running on http://localhost:${port}`);
  console.log(`  Model: ${MODEL_NAME}`);
  console.log(`  Ollama: ${process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434/v1'}`);
});
