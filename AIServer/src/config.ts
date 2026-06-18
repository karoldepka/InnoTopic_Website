import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 8001),

  // Primary provider: 'anthropic' | 'openai'
  provider: (process.env.AI_PROVIDER ?? 'anthropic') as 'anthropic' | 'openai',

  anthropic: {
    model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },

  openai: {
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },

  systemPrompt: process.env.SYSTEM_PROMPT ??
    "You are a helpful AI assistant for InnoTopic, Karol Depka's portfolio and " +
    'software development company. Be concise and friendly.',
};
