import { describe, expect, it } from 'vitest';
import { extractQuestionItems, mapConcurrently, partitionTreeBySecondLevel } from './qa-partition.js';

const node = (id: string, children: any[] = []) => ({ id, title: id, questionCount: 3, children });

describe('Q&A partitioning', () => {
  it('makes each 2nd-level category a path-titled root and keeps childless roots whole', () => {
    const partitions = partitionTreeBySecondLevel([node('pg', [node('indexes', [node('btree')]), node('joins')]), node('solo')]);
    expect(partitions.map(p => p.map(root => `${root.id}:${root.title}`)))
      .toEqual([['indexes:pg > indexes'], ['joins:pg > joins'], ['solo:solo']]);
    expect(partitions[0]![0]!.children[0]!.id).toBe('btree');
  });

  it('extracts complete items from fenced or truncated output', async () => {
    const item = '{"categoryId":"a","categoryPath":"P > A","question":"Q1?","answer":"A1"}';
    expect(await extractQuestionItems('```json\n{"items":[' + item + ']}\n```')).toHaveLength(1);
    expect(await extractQuestionItems('{"items":[' + item + ',{"categoryId":"b","question":"Q2')).toHaveLength(1);
    expect(await extractQuestionItems('no json here')).toEqual([]);
  });

  it('runs with bounded concurrency and yields every result', async () => {
    let inFlight = 0, maxInFlight = 0;
    const results: number[] = [];
    for await (const r of mapConcurrently([1, 2, 3, 4, 5], 2, async n => {
      inFlight++; maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise(resolve => setTimeout(resolve, 5 * (6 - n)));
      inFlight--;
      return n;
    })) results.push(r);
    expect(results.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(maxInFlight).toBe(2);
  });
});
