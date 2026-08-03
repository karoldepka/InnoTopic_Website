import { Hono } from 'hono';
import { generateText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';

export const journalAdviceRouter = new Hono();

interface JournalAdviceEntry {
  whenCreated: string;
  text: string;
}

interface JournalAdviceRequest {
  entries: JournalAdviceEntry[];
}

const SYSTEM_PROMPT = [
  'You are a thoughtful, supportive journaling coach reading someone\'s own recent private',
  'journal entries at their request. Give concise, specific, encouraging advice: patterns you',
  'notice across entries, gentle suggestions, and things worth reflecting on. Keep it warm and',
  'grounded in what they actually wrote - do not invent details. Plain prose (short paragraphs',
  'and/or a short bulleted list), no headings, no code blocks.',
].join(' ');

async function handleJournalAdvice(c: import('hono').Context) {
  const body = await c.req.json<JournalAdviceRequest>();
  const entries = Array.isArray(body.entries) ? body.entries : [];
  if (!entries.length) {
    return c.json({ error: 'No journal entries to analyze' }, 400);
  }

  const historyText = entries
    .map(e => `[${e.whenCreated}]\n${e.text}`)
    .join('\n\n---\n\n');

  const { text, finishReason } = await generateText({
    model: llm,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Here are my ${entries.length} most recent journal entries, oldest first:\n\n${historyText}\n\nWhat advice do you have for me?`,
    }],
    // See GH #138 - an explicit cap plus surfacing finishReason keeps a cut-off response from
    // silently looking like a complete one to the caller.
    maxOutputTokens: 4096,
    experimental_telemetry: { isEnabled: true, functionId: 'journal-advice' },
  });

  return c.json({ advice: text, modelName: MODEL_NAME, truncated: finishReason === 'length' });
}

journalAdviceRouter.post('/journal-advice', handleJournalAdvice);
journalAdviceRouter.post('/ai-api/journal-advice', handleJournalAdvice);
