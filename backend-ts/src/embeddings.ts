import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';

export const EMBEDDING_MODEL = process.env['EMBEDDING_MODEL'] ?? 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

let embeddingProvider: ReturnType<typeof createOpenAI> | undefined;

function getEmbeddingProvider() {
  if (!embeddingProvider) {
    const apiKey = process.env['EMBEDDING_API_KEY'] ?? process.env['OPENAI_API_KEY'];
    if (!apiKey) throw new Error('EMBEDDING_API_KEY or OPENAI_API_KEY is required for embeddings');

    embeddingProvider = createOpenAI({
      apiKey,
      baseURL: process.env['EMBEDDING_API_BASE_URL'] ?? 'https://api.openai.com/v1',
    });
  }
  return embeddingProvider;
}

export async function createEmbedding(value: string): Promise<number[]> {
  const text = value.trim();
  if (!text) throw new Error('Embedding text must not be empty');

  const result = await embed({
    model: getEmbeddingProvider().embedding(EMBEDDING_MODEL),
    value: text,
  });

  if (result.embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding model ${EMBEDDING_MODEL} returned ${result.embedding.length} dimensions; expected ${EMBEDDING_DIMENSIONS}`,
    );
  }
  return result.embedding;
}

export function toPgVector(value: number[]): string {
  return `[${value.join(',')}]`;
}
