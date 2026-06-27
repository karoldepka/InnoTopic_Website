export function cleanText(text: unknown): string {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

export function slugifyId(title: string, fallback: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || fallback;
}

export function sseData(event: Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/** Iterates a ReadableStream<string> and yields chunks with leading markdown fences stripped. */
export async function* stripJsonFences(
  stream: ReadableStream<string>,
): AsyncGenerator<string> {
  let jsonStarted = false;
  for await (const chunk of stream as unknown as AsyncIterable<string>) {
    let c = chunk;
    if (!jsonStarted) {
      const objIdx = c.indexOf('{');
      const arrIdx = c.indexOf('[');
      const idx = objIdx === -1 ? arrIdx : arrIdx === -1 ? objIdx : Math.min(objIdx, arrIdx);
      if (idx === -1) continue;
      c = c.slice(idx);
      jsonStarted = true;
    }
    c = c.replace(/```/g, '');
    if (c) yield c;
  }
}

/** Extracts a human-readable message from an AI SDK RetryError / APICallError. */
export function extractAiErrorMessage(err: unknown): string {
  const e = err as any;
  // RetryError wraps multiple APICallErrors — use the last one
  const inner = e?.errors?.[e.errors.length - 1] ?? e;
  const body = inner?.responseBody;
  if (body) {
    try {
      const parsed = JSON.parse(body);
      const msg = parsed?.message ?? parsed?.error?.message;
      if (msg) return String(msg);
    } catch { /* ignore */ }
  }
  return String(inner?.message ?? e?.message ?? 'AI API request failed');
}

/**
 * Streams plain text from `gen` to the client.
 * Awaits the first chunk BEFORE sending response headers so that API errors
 * (auth failures, insufficient balance, network issues) can be returned as a
 * proper 502 JSON response instead of a broken stream.
 */
export async function textStreamResponse(
  gen: AsyncIterable<string>,
  c: import('hono').Context,
): Promise<Response> {
  const encoder = new TextEncoder();
  const iter = gen[Symbol.asyncIterator]();

  let first: IteratorResult<string>;
  try {
    first = await iter.next();
  } catch (err) {
    const msg = extractAiErrorMessage(err);
    console.error('[stream] AI API error:', msg);
    return c.json({ error: msg }, 502);
  }

  if (first.done) {
    return new Response('', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(first.value));
      try {
        for await (const chunk of { [Symbol.asyncIterator]: () => iter } as AsyncIterable<string>) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

/** Builds a Response for AG-UI Server-Sent Events. */
export function sseStreamResponse(gen: AsyncGenerator<string>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of gen) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
