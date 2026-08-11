import { Hono } from 'hono';
import { generateText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';

export const journalAdviceRouter = new Hono();

interface JournalAdviceEntry {
  whenCreated: string;
  text: string;
}

interface JournalAdviceConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface JournalAdviceRequest {
  entries: JournalAdviceEntry[];
  // Prior turns *after* the initial entries-grounded message - that first message is always
  // rebuilt from `entries` below rather than carried in this array, so the backend stays
  // stateless (no server-side session) while still being able to replay the full exchange on
  // every call. Empty/omitted on the first request of a conversation.
  conversation?: JournalAdviceConversationMessage[];
}

const SYSTEM_PROMPT = [
  'You are a thoughtful, supportive journaling coach reading someone\'s own recent private',
  'journal entries at their request, in an ongoing conversation with them. Give concise,',
  'specific, encouraging responses: patterns you notice across entries, gentle suggestions, and',
  'things worth reflecting on. Keep it warm and grounded in what they actually wrote - do not',
  'invent details. You may ask a clarifying question first if it would meaningfully improve your',
  'advice (e.g. their overall mood, whether a pattern you noticed matches how they actually',
  'feel) - at most one question at a time, and only when it would genuinely help rather than as',
  'a matter of routine. Once you have enough to go on, give your advice directly, and keep',
  'responding naturally to whatever they say next. Plain prose (short paragraphs and/or a short',
  'bulleted list), no headings, no code blocks.',
].join(' ');

async function handleJournalAdvice(c: import('hono').Context) {
  const body = await c.req.json<JournalAdviceRequest>();
  const entries = Array.isArray(body.entries) ? body.entries : [];
  if (!entries.length) {
    return c.json({ error: 'No journal entries to analyze' }, 400);
  }
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];

  const historyText = entries
    .map(e => `[${e.whenCreated}]\n${e.text}`)
    .join('\n\n---\n\n');

  const { text, finishReason } = await generateText({
    model: llm,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here are my ${entries.length} most recent journal entries, oldest first:\n\n${historyText}\n\nWhat advice do you have for me?`,
      },
      ...conversation,
    ],
    // See GH #138 - an explicit cap plus surfacing finishReason keeps a cut-off response from
    // silently looking like a complete one to the caller.
    maxOutputTokens: 4096,
    experimental_telemetry: { isEnabled: true, functionId: 'journal-advice' },
  });

  return c.json({ advice: text, modelName: MODEL_NAME, truncated: finishReason === 'length' });
}

journalAdviceRouter.post('/journal-advice', handleJournalAdvice);
journalAdviceRouter.post('/ai-api/journal-advice', handleJournalAdvice);
