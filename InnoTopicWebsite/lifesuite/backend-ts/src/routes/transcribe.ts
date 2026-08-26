import { Hono } from 'hono';
import { createOpenAI } from '@ai-sdk/openai';
import { experimental_transcribe as transcribe } from 'ai';
import { logTranscriptionCost } from '../ai-cost.js';

export const transcribeRouter = new Hono();

// Real OpenAI Whisper/gpt-4o-transcribe access, independent of the general-purpose chat `llm` in
// llm.ts - that one is often pointed at an OpenAI-*compatible* endpoint (Ollama, a local proxy)
// via AI_API_BASE_URL, which doesn't serve transcription models at all. Needs its own real
// OPENAI_API_KEY regardless of what AI_API_BASE_URL/AI_API_KEY are set to.
let _openai: ReturnType<typeof createOpenAI> | null = null;
function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
    _openai = createOpenAI({ apiKey });
  }
  return _openai;
}

// gpt-4o-transcribe is OpenAI's newer, generally more accurate multilingual model; whisper-1
// remains available as a cheaper/more established fallback via TRANSCRIPTION_MODEL.
const MODEL_ID = process.env['TRANSCRIPTION_MODEL'] ?? 'gpt-4o-transcribe';

async function handleTranscribe(c: import('hono').Context) {
  const formData = await c.req.formData();
  const audioFile = formData.get('audio');
  if (!(audioFile instanceof File)) {
    return c.json({ error: 'Missing "audio" file field (multipart/form-data)' }, 400);
  }
  // ISO-639-1 code (e.g. 'pl', 'en', 'es', 'de', 'pt', 'it', 'fr') - optional hint, omit to let
  // the model auto-detect.
  const language = formData.get('language');

  const bytes = new Uint8Array(await audioFile.arrayBuffer());
  try {
    const result = await transcribe({
      model: getOpenAI().transcription(MODEL_ID),
      audio: bytes,
      providerOptions: language ? { openai: { language: String(language) } } : undefined,
    });
    logTranscriptionCost('transcribe', MODEL_ID, result.durationInSeconds);
    return c.json({
      text: result.text,
      language: result.language ?? null,
      durationSeconds: result.durationInSeconds ?? null,
    });
  } catch (error) {
    console.error('[transcribe] failed', error);
    const message = error instanceof Error ? error.message : 'Transcription failed';
    return c.json({ error: message }, 500);
  }
}

transcribeRouter.post('/ai-api/transcribe', handleTranscribe);
