import { Hono } from 'hono';
import { streamText, type CoreMessage } from 'ai';
import { config } from '../config.js';
import { getModel } from '../model.js';

const chat = new Hono();

// UIMessage from ai@6 has `parts`; plain senders use `content` string.
function toText(msg: { content?: string; parts?: Array<{ type: string; text?: string }> }): string {
  if (msg.parts?.length) {
    return msg.parts
      .filter(p => p.type === 'text')
      .map(p => p.text ?? '')
      .join('');
  }
  return msg.content ?? '';
}

chat.post('/', async (c) => {
  const body = await c.req.json<{
    id?: string;
    messages: Array<{
      role: string;
      content?: string;
      parts?: Array<{ type: string; text?: string }>;
    }>;
  }>();

  type TextMessage = { role: 'user' | 'assistant' | 'system'; content: string };
  const coreMessages: TextMessage[] = body.messages
    .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: toText(m),
    }))
    .filter(m => m.content.length > 0);

  const result = streamText({
    model: getModel(),
    system: config.systemPrompt,
    messages: coreMessages,
  });

  return result.toTextStreamResponse({
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
});

export default chat;
