import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Anthropic's real API, called directly (not through an OpenAI-compatible proxy) - takes
// priority when ANTHROPIC_API_KEY is set, regardless of what AI_API_BASE_URL/AI_API_KEY below
// are pointed at, so switching providers is a matter of setting/unsetting one env var rather
// than commenting different blocks in/out. createAnthropic() defaults apiKey to this same env
// var itself, but reading it here first is what lets the ternary below decide which provider to
// use at all.
const anthropicApiKey = process.env['ANTHROPIC_API_KEY'];

const anthropicProvider = anthropicApiKey ? createAnthropic({ apiKey: anthropicApiKey }) : undefined;

// Supports any OpenAI-compatible endpoint (local proxy, Ollama, Sub2API, etc.)
// For Anthropic proxies set AI_API_BASE_URL=http://localhost:8080/v1
// and AI_API_KEY=<ANTHROPIC_AUTH_TOKEN value>.
const openaiCompatProvider = createOpenAI({
  baseURL: process.env['AI_API_BASE_URL'] ?? 'http://localhost:11434/v1',
  apiKey: process.env['AI_API_KEY'] ?? 'ollama',
});

export const MODEL_NAME = process.env['AI_MODEL'] ?? (anthropicProvider ? 'claude-haiku-4-5-20251001' : 'llama3.2');

// Anthropic's own SDK targets its Messages API directly - no Chat-Completions-vs-Responses-API
// ambiguity to route around (see the Chat Completions comment below), so the bare call is fine
// here.
//
// For the OpenAI-compatible path: .chat(), not the bare openaiCompatProvider(modelId) - since AI
// SDK 5, that shorthand calls the newer Responses API by default (POSTs expecting a `{ output:
// [{ id, ... }] }` response). Ollama and Anthropic-proxy setups (this file's two documented
// AI_API_BASE_URL targets, see the comment above) only implement the older Chat Completions API,
// so the SDK's response parsing failed validation at output[0].id - confirmed live via the exact
// error every "Get AI advice" call was producing. (A Sub2API "group" whose *own* upstream is the
// newer Responses API - as opposed to being proxied through Sub2API at all - would need the bare
// call instead; that's a property of the specific proxy/group, not something this file can detect,
// so it isn't handled generically here.)
export const llm = anthropicProvider ? anthropicProvider(MODEL_NAME) : openaiCompatProvider.chat(MODEL_NAME);
