import { Hono } from 'hono';
import { streamText, generateText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';
import { webSearch } from '../web-search.js';
import { buildAnswerMessages } from '../prompts.js';
import { textStreamResponse } from '../utils.js';

export const quizRouter = new Hono();

interface AnswerRequest {
  question: string;
  context?: string;
  web_search?: boolean;
}

async function handleGenerateAnswer(c: import('hono').Context) {
  const body = await c.req.json<AnswerRequest>();
  const searchResults = body.web_search ? await webSearch(body.question) : [];
  const messages = buildAnswerMessages(body.question, body.context ?? '', searchResults);

  const { text } = await generateText({
    model: llm,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'generate-answer' },
  });
  return c.json({ answer: text, modelName: MODEL_NAME, searchResults });
}

async function handleGenerateAnswerStream(c: import('hono').Context) {
  const body = await c.req.json<AnswerRequest>();
  const searchResults = body.web_search ? await webSearch(body.question) : [];
  const messages = buildAnswerMessages(body.question, body.context ?? '', searchResults);

  const { textStream } = streamText({
    model: llm,
    messages,
    experimental_telemetry: { isEnabled: true, functionId: 'generate-answer-stream' },
  });

  async function* passthrough() {
    for await (const chunk of textStream as AsyncIterable<string>) {
      yield chunk;
    }
  }

  return textStreamResponse(passthrough());
}

quizRouter.post('/generate-answer', handleGenerateAnswer);
quizRouter.post('/ai-api/generate-answer', handleGenerateAnswer);
quizRouter.post('/generate-answer-stream', handleGenerateAnswerStream);
quizRouter.post('/ai-api/generate-answer-stream', handleGenerateAnswerStream);
