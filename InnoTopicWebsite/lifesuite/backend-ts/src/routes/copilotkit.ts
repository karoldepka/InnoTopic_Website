import { Hono } from 'hono';
import { streamText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';
import { buildCopilotMessages } from '../prompts.js';
import { sseData, sseStreamResponse } from '../utils.js';
import { logStreamLanguageModelCost } from '../ai-cost.js';
import type { AgUiRunInput } from '../types.js';

export const copilotRouter = new Hono();

async function handleCopilotAgui(c: import('hono').Context) {
  const body = await c.req.json<AgUiRunInput>();
  const { threadId, runId, messages } = body;

  const prompt = buildCopilotMessages(messages);
  const result = streamText({
    model: llm,
    system: prompt.system,
    messages: prompt.messages,
    experimental_telemetry: { isEnabled: true, functionId: 'copilotkit-agui' },
  });
  logStreamLanguageModelCost('copilotkit-agui', MODEL_NAME, result.usage);

  const messageId = `msg_${crypto.randomUUID().replace(/-/g, '')}`;

  async function* generate() {
    yield sseData({ type: 'RUN_STARTED', threadId, runId });
    yield sseData({ type: 'TEXT_MESSAGE_START', messageId, role: 'assistant' });

    const parts: string[] = [];
    try {
      for await (const chunk of result.textStream as AsyncIterable<string>) {
        if (!chunk) continue;
        parts.push(chunk);
        yield sseData({ type: 'TEXT_MESSAGE_CONTENT', messageId, delta: chunk });
      }
    } catch (err) {
      const msg = `\n\n[AI backend error: ${String(err)}]`;
      parts.push(msg);
      yield sseData({ type: 'TEXT_MESSAGE_CONTENT', messageId, delta: msg });
    }

    yield sseData({ type: 'TEXT_MESSAGE_END', messageId });
    yield sseData({
      type: 'RUN_FINISHED',
      threadId,
      runId,
      result: { messageId, answer: parts.join('') },
    });
  }

  return sseStreamResponse(generate());
}

copilotRouter.post('/copilotkit-agui', handleCopilotAgui);
copilotRouter.post('/ai-api/copilotkit-agui', handleCopilotAgui);
