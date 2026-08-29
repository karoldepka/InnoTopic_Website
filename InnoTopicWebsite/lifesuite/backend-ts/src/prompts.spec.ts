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

  it('prevents earlier Q&A from revealing material tested by later items in every mode', () => {
    const baseRequest = { tree: [], web_search: false };
    const regularSystem = buildQAMessages(baseRequest, []).system;
    const abcdSystem = buildQAMessages({ ...baseRequest, abcd_answers: true }, []).system;

    for (const system of [regularSystem, abcdSystem]) {
      expect(system).toContain('Order items to prevent forward leakage');
      expect(system).toContain('neither an earlier question nor its answer may reveal');
      expect(system).toContain('place the disclosed-fact question first');
    }
  });
});
