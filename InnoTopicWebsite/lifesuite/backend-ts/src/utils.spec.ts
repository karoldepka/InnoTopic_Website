import {describe, it, expect} from 'vitest';
import {stripJsonFences} from './utils.js';

function streamOf(chunks: string[]): ReadableStream<string> {
  return new ReadableStream<string>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<string>): Promise<string> {
  let out = '';
  for await (const chunk of stripJsonFences(stream)) {
    out += chunk;
  }
  return out;
}

describe('stripJsonFences', () => {
  it('strips a fence that arrives whole in a single chunk', async () => {
    const result = await collect(streamOf(['```json\n{"a":1}\n```']));
    expect(result).toBe('{"a":1}\n');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('passes through JSON with no fence at all', async () => {
    const result = await collect(streamOf(['{"a":1}']));
    expect(result).toBe('{"a":1}');
  });

  // GH #129: a ``` fence marker split across two chunks (one ending in "``", the next starting
  // with "`json\n...") used to leak stray backticks into the JSON text, occasionally breaking
  // strict JSON.parse and silently truncating the accumulated content via the AI SDK's
  // partial-JSON-repair fallback. Regression guard for the pendingBackticks carry-over fix.
  it('strips an opening fence split across chunk boundaries', async () => {
    const result = await collect(streamOf(['``', '`json\n{"a":1}\n```']));
    expect(result).toBe('{"a":1}\n');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('strips a closing fence split across chunk boundaries', async () => {
    const result = await collect(streamOf(['```json\n{"a":1}\n``', '`']));
    expect(result).toBe('{"a":1}\n');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('strips a fence split one backtick at a time across many chunks', async () => {
    const result = await collect(streamOf(['`', '`', '`', 'json\n{"a":1}\n', '`', '`', '`']));
    expect(result).toBe('{"a":1}\n');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('flushes trailing backticks if the stream ends mid-fence', async () => {
    // Not a real-world case (a well-formed response always closes its own fence), but the
    // generator must not silently swallow content it buffered - see the `pendingBackticks` flush
    // after the main loop in stripJsonFences().
    const result = await collect(streamOf(['{"a":1}', '``']));
    expect(result).toBe('{"a":1}``');
  });

  it('skips any preamble before the first { or [', async () => {
    const result = await collect(streamOf(['Here you go:\n```json\n{"a":1}\n```']));
    expect(result).toBe('{"a":1}\n');
  });

  it('reassembles a realistic multi-chunk streamed response correctly', async () => {
    // Mimics how an LLM response actually arrives: split at arbitrary token boundaries, not
    // conveniently aligned with the fence markers.
    const chunks = ['``', '`json\n{"quest', 'ion":"What is 2+2?","ans', 'wer":"4"}\n``', '`'];
    const result = await collect(streamOf(chunks));
    expect(JSON.parse(result)).toEqual({question: 'What is 2+2?', answer: '4'});
  });
});
