import { describe, expect, it } from 'vitest';
import { buildQAMessages } from './prompts.js';

describe('ABCD Q&A prompt', () => {
  it('requires same-domain, tricky distractors only in multiple-choice mode', () => {
    const baseRequest = { tree: [], web_search: false };
    const abcdSystem = buildQAMessages({ ...baseRequest, abcd_answers: true }, []).system;
    const regularSystem = buildQAMessages(baseRequest, []).system;

    expect(abcdSystem).toContain('credible near-misses from the same domain');
    expect(abcdSystem).toContain('Never use obviously unrelated filler');
    expect(regularSystem).not.toContain('credible near-misses from the same domain');
  });
});
