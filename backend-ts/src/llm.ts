import { createOpenAI } from '@ai-sdk/openai';

// Ollama exposes an OpenAI-compatible API at /v1
const provider = createOpenAI({
  baseURL: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434/v1',
  apiKey: 'ollama', // required but ignored by Ollama
});

export const MODEL_NAME = process.env['OLLAMA_MODEL'] ?? 'llama3.2';

export const llm = provider(MODEL_NAME);
