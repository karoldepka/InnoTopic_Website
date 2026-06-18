import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModelV1 } from 'ai';
import { config } from './config.js';

export function getModel(): LanguageModelV1 {
  if (config.provider === 'openai') {
    const openai = createOpenAI({ apiKey: config.openai.apiKey });
    return openai(config.openai.model);
  }
  const anthropic = createAnthropic({ apiKey: config.anthropic.apiKey });
  return anthropic(config.anthropic.model);
}
