import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config.js';
import chat from './routes/chat.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: '*' }));

// Health check
app.get('/health', c => c.json({ status: 'ok', provider: config.provider }));

// Vercel AI SDK chat — mounted at /chat so the proxy can reach it via /ai-api/chat
app.route('/chat', chat);

serve({ fetch: app.fetch, port: config.port }, info => {
  console.log(`AI Server running on http://localhost:${info.port}`);
  console.log(`  Provider : ${config.provider}`);
  console.log(`  Model    : ${config.provider === 'anthropic' ? config.anthropic.model : config.openai.model}`);
});
