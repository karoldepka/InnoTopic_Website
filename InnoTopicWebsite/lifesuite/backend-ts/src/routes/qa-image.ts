import { Hono } from 'hono';
import { createOpenAI } from '@ai-sdk/openai';
import { generateImage } from 'ai';
import { logImageGenerationCost } from '../ai-cost.js';

export const qaImageRouter = new Hono();

// Real OpenAI image generation, independent of the general-purpose chat `llm` in llm.ts - same
// reasoning as transcribe.ts's own dedicated OpenAI client: `llm` is frequently pointed at a
// non-OpenAI endpoint (a local Anthropic proxy, Ollama) via AI_API_BASE_URL, and neither of those
// serve image generation. Needs its own real OPENAI_API_KEY regardless of what AI_API_BASE_URL/
// AI_API_KEY are set to.
let _openai: ReturnType<typeof createOpenAI> | null = null;
function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
    _openai = createOpenAI({ apiKey });
  }
  return _openai;
}

// gpt-image-1-mini is the cheapest current OpenAI image model - this is triggered per-flashcard,
// one at a time, by an explicit user click (never generated automatically in bulk), but there's
// no reason to default to a pricier model for a small illustrative image.
const MODEL_ID = process.env['IMAGE_MODEL'] ?? 'gpt-image-1-mini';

async function handleGenerateQuestionImage(c: import('hono').Context) {
  const body = await c.req.json().catch(() => null);
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const answer = typeof body?.answer === 'string' ? body.answer.trim() : '';
  if (!question) {
    return c.json({ error: 'question is required' }, 400);
  }

  const prompt = [
    'A simple, clear educational illustration to accompany a flashcard. No text, letters, or ' +
    'labels anywhere in the image - illustrate the concept visually only.',
    `Question: ${question}`,
    answer ? `Answer: ${answer}` : '',
  ].filter(Boolean).join('\n');

  try {
    const result = await generateImage({
      model: getOpenAI().image(MODEL_ID),
      prompt,
      size: '1024x1024',
    });
    logImageGenerationCost('qa-image', MODEL_ID, '1024x1024', result.images.length);
    return c.json({
      imageDataUrl: `data:${result.image.mediaType};base64,${result.image.base64}`,
    });
  } catch (error) {
    console.error('[qa-image] failed', error);
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return c.json({ error: message }, 500);
  }
}

qaImageRouter.post('/category-tree/questions/image', handleGenerateQuestionImage);
qaImageRouter.post('/ai-api/category-tree/questions/image', handleGenerateQuestionImage);
