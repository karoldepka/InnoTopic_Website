import { Hono } from 'hono';
import { streamText, generateText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { buildAnswerMessages } from '../prompts.js';
import { textStreamResponse } from '../utils.js';
import { logLanguageModelCost, logStreamLanguageModelCost } from '../ai-cost.js';

export const quizRouter = new Hono();

interface AnswerRequest {
  question: string;
  context?: string;
  web_search?: boolean;
}

async function handleGenerateAnswer(c: import('hono').Context) {
  const body = await c.req.json<AnswerRequest>();
  const searchResults = body.web_search ? await webSearch(body.question) : [];
  const { system, messages } = buildAnswerMessages(body.question, body.context ?? '', searchResults);

  const result = await generateText({
    model: llm,
    system,
    messages,
    // GH #138: with no explicit cap, an unspecified default (ours or an upstream proxy's) can be
    // small enough to cut a real answer off mid code-block. `finishReason` below still surfaces a
    // cut-off caused by anything else (a lower proxy-side cap, the model choosing to stop for its
    // own reasons at this same limit, etc.) so the frontend can warn instead of silently saving
    // truncated text.
    maxOutputTokens: 4096,
    experimental_telemetry: { isEnabled: true, functionId: 'generate-answer' },
  });
  logLanguageModelCost('generate-answer', MODEL_NAME, result.usage);
  return c.json({ answer: result.text, modelName: MODEL_NAME, searchResults, truncated: result.finishReason === 'length' });
}

async function handleGenerateAnswerStream(c: import('hono').Context) {
  const body = await c.req.json<AnswerRequest>();
  const searchResults = body.web_search ? await webSearch(body.question) : [];
  const { system, messages } = buildAnswerMessages(body.question, body.context ?? '', searchResults);

  const result = streamText({
    model: llm,
    system,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'generate-answer-stream' },
  });
  logStreamLanguageModelCost('generate-answer-stream', MODEL_NAME, result.usage);

  async function* passthrough() {
    for await (const chunk of result.textStream as AsyncIterable<string>) {
      yield chunk;
    }
  }

  return textStreamResponse(passthrough(), c);
}

quizRouter.post('/generate-answer', handleGenerateAnswer);
quizRouter.post('/ai-api/generate-answer', handleGenerateAnswer);
quizRouter.post('/generate-answer-stream', handleGenerateAnswerStream);
quizRouter.post('/ai-api/generate-answer-stream', handleGenerateAnswerStream);

// ─── Raw prompt (debug) ───────────────────────────────────────────────────────
// Sends the prompt string directly to the model with no system message or schema.
// Useful for testing the connection and seeing what the model actually returns.

async function handleRawPrompt(c: import('hono').Context) {
  const { prompt } = await c.req.json<{ prompt: string }>();
  const result = await generateText({
    model: llm,
    prompt,
    maxRetries: 0,
  });
  logLanguageModelCost('raw-prompt', MODEL_NAME, result.usage);
  return c.json({ response: result.text, model: MODEL_NAME });
}

async function handleRawPromptStream(c: import('hono').Context) {
  const { prompt } = await c.req.json<{ prompt: string }>();
  const result = streamText({
    model: llm,
    prompt,
    maxRetries: 0,
  });
  logStreamLanguageModelCost('raw-prompt-stream', MODEL_NAME, result.usage);
  return textStreamResponse(result.textStream as AsyncIterable<string>, c);
}

quizRouter.post('/ai-api/raw-prompt', handleRawPrompt);
quizRouter.post('/ai-api/raw-prompt-stream', handleRawPromptStream);
