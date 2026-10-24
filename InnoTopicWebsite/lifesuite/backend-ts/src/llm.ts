import type { LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

// Common facade over every supported LLM provider. Routes only ever import `llm` and
// `MODEL_NAME` from here, so switching providers is purely an env-var change:
//
//   AI_PROVIDER=openai-compatible | anthropic | bedrock   (optional - see resolveProviderId())
//   AI_MODEL=<model id for that provider>                (optional except for bedrock)
//
// Each provider's own credentials/endpoint come from its usual env vars, documented per entry.

export type AiProviderId = 'openai-compatible' | 'anthropic' | 'bedrock';

interface AiProvider {
  defaultModel?: string;
  createModel(modelId: string): LanguageModel;
}

const providers: Record<AiProviderId, AiProvider> = {
  // Any OpenAI-compatible endpoint (local proxy, Ollama, Sub2API, etc.):
  // AI_API_BASE_URL (default: local Ollama) + AI_API_KEY.
  // For Anthropic proxies set AI_API_BASE_URL=http://localhost:8080/v1
  // and AI_API_KEY=<ANTHROPIC_AUTH_TOKEN value>.
  //
  // .chat(), not the bare provider(modelId) - since AI SDK 5, that shorthand calls the newer
  // Responses API by default (POSTs expecting a `{ output: [{ id, ... }] }` response). Ollama and
  // Anthropic-proxy setups (this entry's two documented AI_API_BASE_URL targets) only implement
  // the older Chat Completions API, so the SDK's response parsing failed validation at
  // output[0].id - confirmed live via the exact error every "Get AI advice" call was producing. (A
  // Sub2API "group" whose *own* upstream is the newer Responses API - as opposed to being proxied
  // through Sub2API at all - would need the bare call instead; that's a property of the specific
  // proxy/group, not something this file can detect, so it isn't handled generically here.)
  'openai-compatible': {
    defaultModel: 'llama3.2',
    createModel: modelId => createOpenAI({
      baseURL: process.env['AI_API_BASE_URL'] ?? 'http://localhost:11434/v1',
      apiKey: process.env['AI_API_KEY'] ?? 'ollama',
    }).chat(modelId),
  },

  // Anthropic's real API, called directly (not through an OpenAI-compatible proxy):
  // ANTHROPIC_API_KEY. Its Messages API has no Chat-Completions-vs-Responses ambiguity, so the
  // bare call is fine.
  anthropic: {
    defaultModel: 'claude-haiku-4-5-20251001',
    createModel: modelId => createAnthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })(modelId),
  },

  // Amazon Bedrock foundation models (Anthropic, Amazon Nova, Meta Llama, Mistral, ...) via the
  // Converse API. AWS_REGION, plus credentials:
  // - AWS_BEARER_TOKEN_BEDROCK (a Bedrock API key), if set, takes precedence - but some AWS
  //   Organizations deny bearer tokens via an SCP (bedrock:CallWithBearerToken), so
  // - otherwise, the standard AWS SDK credential chain: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
  //   env vars, then the `aws login` / SSO session or ~/.aws profile (AWS_PROFILE picks one), then
  //   container/instance roles. Session credentials are refreshed by the chain as they expire.
  // No default model: Bedrock IDs are account/region specific (e.g. cross-region inference
  // profiles like "us.anthropic...."), so AI_MODEL must name one enabled in your account.
  bedrock: {
    createModel: modelId => createAmazonBedrock(
      process.env['AWS_BEARER_TOKEN_BEDROCK'] ? {} : { credentialProvider: fromNodeProviderChain() },
    )(modelId),
  },
};

/** An explicit AI_PROVIDER wins. Otherwise infer it from which credentials are configured,
 * keeping the historical behaviour first: ANTHROPIC_API_KEY means Anthropic directly, an
 * AI_API_BASE_URL means that OpenAI-compatible endpoint, then a Bedrock API key means Bedrock,
 * and with none of them the OpenAI-compatible default (local Ollama). */
function resolveProviderId(): AiProviderId {
  const requested = process.env['AI_PROVIDER']?.trim().toLowerCase();
  if (requested) {
    if (requested in providers) return requested as AiProviderId;
    throw new Error(`Unknown AI_PROVIDER "${requested}" - expected one of: ${Object.keys(providers).join(', ')}`);
  }
  if (process.env['ANTHROPIC_API_KEY']) return 'anthropic';
  if (process.env['AI_API_BASE_URL']) return 'openai-compatible';
  if (process.env['AWS_BEARER_TOKEN_BEDROCK']) return 'bedrock';
  return 'openai-compatible';
}

export const AI_PROVIDER: AiProviderId = resolveProviderId();

const provider = providers[AI_PROVIDER];

export const MODEL_NAME: string = (() => {
  const modelName = process.env['AI_MODEL'] ?? provider.defaultModel;
  if (!modelName) throw new Error(`AI_MODEL must be set when AI_PROVIDER=${AI_PROVIDER}`);
  return modelName;
})();

export const llm: LanguageModel = provider.createModel(MODEL_NAME);

/** Output-token cap for calls that can produce long output (category trees, Q&A batches, chat).
 * Without one, some providers silently apply a small default - Bedrock's Nova stopped Q&A
 * generation after ~2k tokens, mid-JSON - while exceeding a model's own cap is rejected outright
 * (Nova: 10,000). AI_MAX_OUTPUT_TOKENS overrides the per-model default. */
export const MAX_OUTPUT_TOKENS: number = (() => {
  const configured = Number(process.env['AI_MAX_OUTPUT_TOKENS']);
  if (Number.isInteger(configured) && configured > 0) return configured;
  return MODEL_NAME.toLowerCase().includes('nova-') ? 10_000 : 16_000;
})();
