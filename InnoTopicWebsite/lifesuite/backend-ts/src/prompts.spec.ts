import { describe, expect, it } from 'vitest';
import { buildQAMessages, parseSuggestedCategories } from './prompts.js';

describe('ABCD Q&A prompt', () => {
  it('requires same-domain, tricky distractors only in multiple-choice mode', () => {
    const baseRequest = { tree: [], web_search: false };
    const abcdSystem = buildQAMessages({ ...baseRequest, abcd_answers: true }, []).system;
    const regularSystem = buildQAMessages(baseRequest, []).system;

    expect(abcdSystem).toContain('credible near-misses from the same domain');
    expect(abcdSystem).toContain('Never use obviously unrelated filler');
    expect(abcdSystem).toContain('wrong in only one specific, checkable detail');
    expect(abcdSystem).toContain('must not be the longest, most precise, or most hedged');
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

describe('suggested categories parsing', () => {
  it('parses JSON, de-duplicates case-insensitively and caps at three', () => {
    expect(parseSuggestedCategories('```json\n{"categories":["RAG","rag"," Vector DBs ","LLM","AI"]}\n```'))
      .toEqual(['RAG', 'Vector DBs', 'LLM']);
  });

  it('falls back to a comma-separated line', () => {
    expect(parseSuggestedCategories('Postgres, #indexes')).toEqual(['Postgres', 'indexes']);
  });
});
