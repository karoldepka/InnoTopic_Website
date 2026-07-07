import './instrumentation.js';
import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './app.js';
import { MODEL_NAME } from './llm.js';

/** Local dev / traditional-Node entry point only - Vercel's serverless deployment goes through
 * ../api/index.ts instead (Vercel's Functions runtime provides its own request listener, it never
 * runs this file or calls serve() itself). */
const port = parseInt(process.env['PORT'] ?? '8000', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`LifeSuite AI backend (TS) running on http://localhost:${port}`);
  console.log(`  Model: ${MODEL_NAME}`);
  console.log(`  Ollama: ${process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434/v1'}`);
});
