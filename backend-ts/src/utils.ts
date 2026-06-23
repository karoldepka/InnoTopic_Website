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
      const idx = c.indexOf('{');
      if (idx === -1) continue;
      c = c.slice(idx);
      jsonStarted = true;
    }
    c = c.replace(/```/g, '');
    if (c) yield c;
  }
}

/** Builds a Response that streams plain text — what the frontend StructuredObject expects. */
export function textStreamResponse(gen: AsyncGenerator<string>): Response {
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
