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
