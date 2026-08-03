export const EMBEDDING_MODEL = process.env['EMBEDDING_MODEL'] ?? 'nomic-embed-text';
export const EMBEDDING_DIMENSIONS = 768;

interface OllamaEmbedResponse {
  embeddings?: number[][];
}

function getOllamaBaseUrl(): string {
  return (process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434').replace(/\/$/, '');
}

async function embedWithOllama(texts: string[]): Promise<number[][]> {
  const response = await fetch(`${getOllamaBaseUrl()}/api/embed`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({model: EMBEDDING_MODEL, input: texts}),
  });
  if (!response.ok) {
    throw new Error(`Ollama embedding request failed (${response.status}): ${await response.text()}`);
  }

  const result = await response.json() as OllamaEmbedResponse;
  if (!result.embeddings || result.embeddings.length !== texts.length) {
    throw new Error(`Ollama returned ${result.embeddings?.length ?? 0} embeddings for ${texts.length} texts`);
  }
  for (const embedding of result.embeddings) {
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Embedding model ${EMBEDDING_MODEL} returned ${embedding.length} dimensions; expected ${EMBEDDING_DIMENSIONS}`,
      );
    }
  }
  return result.embeddings;
}

export async function createEmbedding(value: string): Promise<number[]> {
  const text = value.trim();
  if (!text) throw new Error('Embedding text must not be empty');

  return (await embedWithOllama([text]))[0]!;
}

export async function createEmbeddings(values: string[]): Promise<number[][]> {
  const texts = values.map(value => value.trim());
  if (!texts.length || texts.some(text => !text)) {
    throw new Error('Embedding texts must not be empty');
  }

  return embedWithOllama(texts);
}

export function toPgVector(value: number[]): string {
  return `[${value.join(',')}]`;
}
