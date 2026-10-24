import { afterEach, describe, expect, it, vi } from 'vitest';
import { logLanguageModelCost, logStreamLanguageModelCost } from './ai-cost.js';

describe('AI cost logging', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('records model usage and a Haiku default estimate without prompt content', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logLanguageModelCost('test-operation', 'claude-haiku-4-5-20251001', {
      inputTokens: 1_000,
      outputTokens: 500,
      totalTokens: 1_500,
    });

    expect(info).toHaveBeenCalledWith('[ai-cost]', expect.objectContaining({
      operation: 'test-operation',
      inputTokens: 1_000,
      outputTokens: 500,
      estimatedUsd: 0.0035,
    }));
  });

  it('prices GPT-5.4 variants by their most specific match', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const usage = { inputTokens: 1_000_000, outputTokens: 100_000 };

    logLanguageModelCost('base', 'gpt-5.4', usage);
    logLanguageModelCost('mini', 'gpt-5.4-mini', usage);

    expect(info).toHaveBeenCalledWith('[ai-cost]', expect.objectContaining({ operation: 'base', estimatedUsd: 4 }));
    expect(info).toHaveBeenCalledWith('[ai-cost]', expect.objectContaining({ operation: 'mini', estimatedUsd: 1.2 }));
  });

  it('prices Bedrock Nova models from their inference-profile IDs', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logLanguageModelCost('nova', 'eu.amazon.nova-pro-v1:0', { inputTokens: 1_000_000, outputTokens: 1_000_000 });

    expect(info).toHaveBeenCalledWith('[ai-cost]', expect.objectContaining({ operation: 'nova', estimatedUsd: 4 }));
  });

  it('logs usage once a stream has completed', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logStreamLanguageModelCost('stream-operation', 'llama3.2', Promise.resolve({
      inputTokens: 20,
      outputTokens: 10,
    }));
    await Promise.resolve();

    expect(info).toHaveBeenCalledWith('[ai-cost]', expect.objectContaining({
      operation: 'stream-operation',
      estimatedUsd: 0,
    }));
  });
});
