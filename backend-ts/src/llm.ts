import { createOpenAI } from '@ai-sdk/openai';

// Supports any OpenAI-compatible endpoint (local proxy, Ollama, Sub2API, etc.)
// For Anthropic proxies set AI_API_BASE_URL=http://localhost:8080/v1
// and AI_API_KEY=<ANTHROPIC_AUTH_TOKEN value>.
const provider = createOpenAI({
  baseURL: process.env['AI_API_BASE_URL'] ?? 'http://localhost:11434/v1',
  apiKey: process.env['AI_API_KEY'] ?? 'ollama',
  compatibility: 'compatible',
});

export const MODEL_NAME = process.env['AI_MODEL'] ?? 'llama3.2';

export const llm = provider(MODEL_NAME);
