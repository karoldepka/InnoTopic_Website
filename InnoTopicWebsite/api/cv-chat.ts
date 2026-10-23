/**
 * CV chat: answers visitors' questions about Karol's CV with Claude on Amazon Bedrock, streaming the
 * answer as plain text, which is what the chat page's TextStreamChatTransport reads.
 *
 * Configuration (Vercel project environment variables; in the shell for scripts/dev-api.mjs):
 * - Credentials, first found wins: AWS_BEARER_TOKEN_BEDROCK (a Bedrock API key); or
 *   BEDROCK_AWS_ACCESS_KEY_ID + BEDROCK_AWS_SECRET_ACCESS_KEY (Vercel reserves the plain AWS_* names);
 *   or, locally, the default AWS credential chain (~/.aws, AWS_PROFILE, ...).
 * - BEDROCK_AWS_REGION (default: AWS_REGION, then us-east-1).
 * - BEDROCK_MODEL (default: anthropic.claude-opus-5-5).
 *
 * The CV itself comes from api/_cv-context.ts; regenerate it with `pnpm cv-context`.
 */
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicBedrockMantle } from '@anthropic-ai/bedrock-sdk';
import { CV_CONTEXT } from './_cv-context';

const MODEL = process.env['BEDROCK_MODEL'] ?? 'anthropic.claude-opus-5-5';
/** Bounds what one visitor's request can send and cost. */
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4000;

const SYSTEM_PROMPT = `You answer questions about Karol Depka Pradzinski's CV for visitors of his website: recruiters, potential clients and fellow engineers.

Answer from the CV below. When it doesn't cover something, say so and suggest contacting Karol directly, rather than guessing. Keep answers short and conversational, and reply in the language the visitor writes in. Write plain text without Markdown: the chat shows text as-is.

<cv>
${CV_CONTEXT}
</cv>`;

let client: AnthropicBedrockMantle | undefined;

function bedrock(): AnthropicBedrockMantle {
  const accessKey = process.env['BEDROCK_AWS_ACCESS_KEY_ID'];
  return client ??= new AnthropicBedrockMantle({
    awsRegion: process.env['BEDROCK_AWS_REGION'] ?? process.env['AWS_REGION'] ?? 'us-east-1',
    ...(accessKey && {
      awsAccessKey: accessKey,
      awsSecretAccessKey: process.env['BEDROCK_AWS_SECRET_ACCESS_KEY'],
      awsSessionToken: process.env['BEDROCK_AWS_SESSION_TOKEN'],
    }),
  });
}

/** The subset of the AI SDK's UIMessage that the chat page sends. */
interface ChatRequest {
  messages?: { role?: string; parts?: { type?: string; text?: string }[] }[];
}

/** The conversation as the Messages API wants it: text only, starting with the visitor. */
function toMessages(request: ChatRequest): Anthropic.MessageParam[] {
  const messages = (request.messages ?? [])
    .filter(message => message.role === 'user' || message.role === 'assistant')
    .map((message): Anthropic.MessageParam => ({
      role: message.role as 'user' | 'assistant',
      content: (message.parts ?? [])
        .filter(part => part.type === 'text')
        .map(part => part.text ?? '')
        .join('')
        .slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter(message => (message.content as string).trim())
    .slice(-MAX_MESSAGES);
  while (messages[0]?.role === 'assistant') messages.shift();
  return messages;
}

/** What the visitor sees when the call fails; details go to the function log. */
function errorText(error: unknown): string {
  // No credentials configured at all fails before the request, as a connection error from the AWS credential chain.
  const noCredentials = error instanceof Anthropic.APIConnectionError
    && (error.cause as Error | undefined)?.name === 'CredentialsProviderError';
  if (noCredentials || error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return "The CV chat isn't connected to Amazon Bedrock yet.";
  }
  if (error instanceof Anthropic.RateLimitError) return 'The CV chat is busy right now; please try again in a minute.';
  return 'The CV chat ran into a problem; please try again.';
}

export async function POST(request: Request): Promise<Response> {
  let messages: Anthropic.MessageParam[];
  try {
    messages = toMessages(await request.json() as ChatRequest);
  } catch {
    return new Response('Expected a JSON body', { status: 400 });
  }
  if (messages.at(-1)?.role !== 'user') return new Response('Expected a question', { status: 400 });

  const stream = bedrock().messages.stream({
    model: MODEL,
    max_tokens: 16000,
    // Conversational answers from a given document: low effort keeps them quick and cheap.
    output_config: { effort: 'low' },
    // The CV is the same for every visitor, so it is cached across requests.
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answered = false;
      // A note after a partial answer goes on its own paragraph.
      const note = (text: string) => controller.enqueue(encoder.encode(answered ? `\n\n${text}` : text));
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
            answered = true;
          }
        }
        const message = await stream.finalMessage();
        if (message.stop_reason === 'refusal') note("Sorry, I can't help with that one.");
      } catch (error) {
        console.error('CV chat failed:', error);
        note(errorText(error));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
