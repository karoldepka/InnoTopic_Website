import { Hono } from 'hono';
import { generateText, streamText } from 'ai';
import { llm, MODEL_NAME } from '../llm.js';
import { textStreamResponse } from '../utils.js';
import { logLanguageModelCost, logStreamLanguageModelCost } from '../ai-cost.js';

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

function buildJournalAdviceMessages(entries: JournalAdviceEntry[], conversation: JournalAdviceConversationMessage[]) {
  const historyText = entries
    .map(e => `[${e.whenCreated}]\n${e.text}`)
    .join('\n\n---\n\n');

  return [
    {
      role: 'user' as const,
      content: `Here are my ${entries.length} most recent journal entries, oldest first:\n\n${historyText}\n\nWhat advice do you have for me?`,
    },
    ...conversation,
  ];
}

async function handleJournalAdvice(c: import('hono').Context) {
  const body = await c.req.json<JournalAdviceRequest>();
  const entries = Array.isArray(body.entries) ? body.entries : [];
  if (!entries.length) {
    return c.json({ error: 'No journal entries to analyze' }, 400);
  }
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];

  const result = await generateText({
    model: llm,
    system: SYSTEM_PROMPT,
    messages: buildJournalAdviceMessages(entries, conversation),
    // See GH #138 - an explicit cap plus surfacing finishReason keeps a cut-off response from
    // silently looking like a complete one to the caller.
    maxOutputTokens: 4096,
    experimental_telemetry: { isEnabled: true, functionId: 'journal-advice' },
  });
  logLanguageModelCost('journal-advice', MODEL_NAME, result.usage);

  return c.json({ advice: result.text, modelName: MODEL_NAME, truncated: result.finishReason === 'length' });
}

journalAdviceRouter.post('/journal-advice', handleJournalAdvice);
journalAdviceRouter.post('/ai-api/journal-advice', handleJournalAdvice);

/** Streaming counterpart of handleJournalAdvice() - same messages/system prompt, plain text
 * chunks instead of a single JSON payload, so the chat UI can show the reply as it's written
 * instead of a blank bubble until the whole thing finishes (journal advice can run to several
 * paragraphs at maxOutputTokens: 4096, which is a long wait to stare at nothing). MODEL_NAME goes
 * out as a response header (known before generation starts) rather than in the stream body -
 * `truncated` (only knowable from `finishReason`, which only resolves once the stream ends) isn't
 * surfaced here at all; the non-streaming endpoint above still carries both for any caller that
 * wants them and can afford to wait for the full response anyway. */
async function handleJournalAdviceStream(c: import('hono').Context) {
  const body = await c.req.json<JournalAdviceRequest>();
  const entries = Array.isArray(body.entries) ? body.entries : [];
  if (!entries.length) {
    return c.json({ error: 'No journal entries to analyze' }, 400);
  }
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];

  const result = streamText({
    model: llm,
    system: SYSTEM_PROMPT,
    messages: buildJournalAdviceMessages(entries, conversation),
    maxOutputTokens: 4096,
    maxRetries: 0,
    experimental_telemetry: { isEnabled: true, functionId: 'journal-advice-stream' },
  });
  logStreamLanguageModelCost('journal-advice-stream', MODEL_NAME, result.usage);

  return textStreamResponse(result.textStream, c, { 'X-Model-Name': MODEL_NAME });
}

journalAdviceRouter.post('/journal-advice/stream', handleJournalAdviceStream);
journalAdviceRouter.post('/ai-api/journal-advice/stream', handleJournalAdviceStream);
