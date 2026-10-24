import { parsePartialJson } from 'ai';
import type { CategoryNode, QuestionAnswer } from './types.js';

/** Splits a category tree into one subtree per 2nd-level category, so a big Q&A request can be
 * generated as several smaller, parallel prompts. Each 2nd-level category becomes the partition's
 * root, titled with its full path ("Postgres > Indexes") so generated categoryPaths stay the same.
 * (Keeping the original 0-question root above a single child made Qwen3 32B often answer with no
 * items at all.) A root without children is its own partition. */
export function partitionTreeBySecondLevel(tree: CategoryNode[]): CategoryNode[][] {
  return tree.flatMap(root => root.children?.length
    ? root.children.map(child => [{ ...child, title: `${root.title} > ${child.title}` }])
    : [[root]]);
}

/** Pulls the Q&A items out of one partition's model output, tolerating markdown fences and a
 * response cut off mid-item (only complete items are kept). */
export async function extractQuestionItems(text: string): Promise<QuestionAnswer[]> {
  const start = text.indexOf('{');
  if (start === -1) return [];
  const { value } = await parsePartialJson(text.slice(start).replace(/```/g, ''));
  const items = (value as { items?: unknown } | undefined)?.items;
  return Array.isArray(items)
    ? items.filter((item): item is QuestionAnswer =>
      !!item && typeof item === 'object'
      && ['categoryId', 'categoryPath', 'question', 'answer'].every(key => typeof (item as any)[key] === 'string'))
    : [];
}

/** Runs `worker` over `inputs` with at most `limit` in flight, yielding results as they finish. */
export async function* mapConcurrently<T, R>(inputs: T[], limit: number, worker: (input: T) => Promise<R>): AsyncGenerator<R> {
  const pending = new Map<number, Promise<{ index: number, result: R }>>();
  let next = 0;
  const launch = () => {
    const index = next++;
    pending.set(index, worker(inputs[index]!).then(result => ({ index, result })));
  };
  while (next < inputs.length && pending.size < limit) launch();
  while (pending.size) {
    const { index, result } = await Promise.race(pending.values());
    pending.delete(index);
    if (next < inputs.length) launch();
    yield result;
  }
}
