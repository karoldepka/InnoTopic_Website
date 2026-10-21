type LanguageUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  inputTokenDetails?: { cacheReadTokens?: number };
};

type CostRate = {
  inputPerMillion: number;
  outputPerMillion: number;
  source: string;
};

function configuredNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function languageCostRate(model: string): CostRate {
  // These are deliberately only defaults. A proxy can charge differently, so deployment
  // configuration can always override them with AI_COST_{INPUT,OUTPUT}_PER_MILLION_USD.
  const modelName = model.toLowerCase();
  // First match wins, so more specific variants (gpt-5.4-mini) must precede their base model.
  // GPT-5.4 rates are OpenAI's standard (<272K-token prompt) list prices as of 2026-10.
  const knownRates: Array<[pattern: string, inputPerMillion: number, outputPerMillion: number, source: string]> = [
    ['claude-haiku', 1, 5, 'Claude Haiku default estimate'],
    ['gpt-5.4-pro', 30, 180, 'GPT-5.4 Pro list-price estimate'],
    ['gpt-5.4-mini', 0.75, 4.5, 'GPT-5.4 mini list-price estimate'],
    ['gpt-5.4-nano', 0.2, 1.25, 'GPT-5.4 nano list-price estimate'],
    ['gpt-5.4', 2.5, 15, 'GPT-5.4 list-price estimate'],
    ['llama', 0, 0, 'local-model estimate'],
    ['ollama', 0, 0, 'local-model estimate'],
  ];
  const match = knownRates.find(([pattern]) => modelName.includes(pattern));
  const defaultRate = match
    ? { inputPerMillion: match[1], outputPerMillion: match[2], source: match[3] }
    : { inputPerMillion: 0, outputPerMillion: 0, source: 'unknown model; configure AI_COST_*_PER_MILLION_USD' };

  return {
    inputPerMillion: configuredNumber('AI_COST_INPUT_PER_MILLION_USD', defaultRate.inputPerMillion),
    outputPerMillion: configuredNumber('AI_COST_OUTPUT_PER_MILLION_USD', defaultRate.outputPerMillion),
    source: defaultRate.source,
  };
}

function roundedUsd(value: number): number {
  return Number(value.toFixed(8));
}

/** Logs a single structured record to Vercel/runtime logs without ever including prompt content. */
export function logLanguageModelCost(operation: string, model: string, usage: LanguageUsage): void {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const rate = languageCostRate(model);
  const estimatedUsd = (inputTokens / 1_000_000) * rate.inputPerMillion
    + (outputTokens / 1_000_000) * rate.outputPerMillion;

  console.info('[ai-cost]', {
    operation,
    kind: 'language',
    model,
    inputTokens,
    outputTokens,
    totalTokens: usage.totalTokens ?? inputTokens + outputTokens,
    cachedInputTokens: usage.inputTokenDetails?.cacheReadTokens ?? 0,
    estimatedUsd: roundedUsd(estimatedUsd),
    estimateSource: rate.source,
  });
}

/** Streaming calls only expose usage once their stream has finished. */
export function logStreamLanguageModelCost(
  operation: string,
  model: string,
  usage: PromiseLike<LanguageUsage>,
): void {
  void Promise.resolve(usage)
    .then(value => logLanguageModelCost(operation, model, value))
    .catch(error => console.warn('[ai-cost] Unable to read stream usage', { operation, model, error: String(error) }));
}

export function logImageGenerationCost(operation: string, model: string, size: string, imageCount: number): void {
  const estimatedUsd = configuredNumber('IMAGE_COST_PER_IMAGE_USD', 0.01) * imageCount;
  console.info('[ai-cost]', {
    operation,
    kind: 'image',
    model,
    size,
    imageCount,
    estimatedUsd: roundedUsd(estimatedUsd),
    estimateSource: 'IMAGE_COST_PER_IMAGE_USD or default estimate',
  });
}

export function logTranscriptionCost(operation: string, model: string, durationSeconds: number | null | undefined): void {
  const seconds = durationSeconds ?? 0;
  const perMinuteUsd = configuredNumber('TRANSCRIPTION_COST_PER_MINUTE_USD', 0.006);
  console.info('[ai-cost]', {
    operation,
    kind: 'transcription',
    model,
    durationSeconds: seconds,
    estimatedUsd: roundedUsd((seconds / 60) * perMinuteUsd),
    estimateSource: 'TRANSCRIPTION_COST_PER_MINUTE_USD or default estimate',
  });
}

/** Ollama's API does not return token usage, so use a transparent character-based estimate. */
export function logEmbeddingCost(operation: string, model: string, texts: readonly string[]): void {
  const estimatedTokens = texts.reduce((total, text) => total + Math.ceil(text.length / 4), 0);
  const perMillionUsd = configuredNumber('EMBEDDING_COST_PER_MILLION_TOKENS_USD', 0);
  console.info('[ai-cost]', {
    operation,
    kind: 'embedding',
    model,
    inputCount: texts.length,
    estimatedTokens,
    estimatedUsd: roundedUsd((estimatedTokens / 1_000_000) * perMillionUsd),
    estimateSource: 'character estimate; EMBEDDING_COST_PER_MILLION_TOKENS_USD defaults to local-model cost',
  });
}
