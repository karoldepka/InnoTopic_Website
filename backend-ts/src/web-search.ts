import { tavily } from '@tavily/core';

let _client: ReturnType<typeof tavily> | null = null;

function getClient() {
  const key = process.env['TAVILY_API_KEY'];
  if (!key) return null;
  _client ??= tavily({ apiKey: key });
  return _client;
}

export async function webSearch(query: string, maxResults = 5): Promise<string[]> {
  const client = getClient();
  if (!client || !query.trim()) return [];
  try {
    const result = await client.search(query, { maxResults });
    return (result.results ?? []).slice(0, maxResults).map(item => {
      const parts = [item.title, item.content, item.url].filter(Boolean);
      return parts.join(' - ');
    });
  } catch {
    return [];
  }
}
