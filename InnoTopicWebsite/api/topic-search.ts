/**
 * Semantic topic search: GET /api/topic-search?q=java+ecosystem answers { topics: [...] }, the
 * topics (by exact name) that the query is about, e.g. Java, Kotlin, Spring Boot, Maven, Gradle.
 * The topic search box (TopicSearchService) highlights them alongside its plain name matches.
 *
 * Runs on the Vercel AI Gateway, which authenticates with the project's OIDC token on Vercel, and
 * elsewhere with AI_GATEWAY_API_KEY or a VERCEL_OIDC_TOKEN from `vercel env pull` (e.g.
 * `node --env-file=.env.local scripts/dev-api.mjs`). TOPIC_SEARCH_MODEL overrides the model.
 *
 * The topic catalog comes from api/_topic-categories.ts; regenerate it with `pnpm api-data`.
 */
import { generateText, jsonSchema, Output } from 'ai';
import { TOPIC_CATEGORIES } from './_topic-categories';

// Of the models the AI Gateway's free tier serves, the one that found whole groups ("java ecosystem",
// "cloud monitoring") rather than just the literal name. With paid credits, e.g. anthropic/claude-haiku-5.5.
const MODEL = process.env['TOPIC_SEARCH_MODEL'] ?? 'openai/gpt-5-mini';
const MAX_QUERY_CHARS = 200;

const catalog = TOPIC_CATEGORIES
  .filter(({ topics }) => topics.length)
  .map(({ category, topics }) => `${category}: ${topics.join(', ')}`)
  .join('\n');
/** Topic names by lowercase name, to keep only real topics, spelled as the page spells them. */
const topicsByLowercase = new Map(TOPIC_CATEGORIES.flatMap(({ topics }) => topics).map(name => [name.toLowerCase(), name]));

const SYSTEM_PROMPT = `You are the semantic search of a software developer's CV website. Visitors type a query and the page highlights the matching technology topics.

Given the query, pick every topic from the catalog below that the query is about: the topics it names or describes, the members of a group it names (e.g. "databases": every database; "java ecosystem": Java, the JVM languages, and Java frameworks, build tools and IDEs), and close synonyms. Leave out topics that are only loosely related. Return each topic's name exactly as the catalog spells it, and no topics when nothing fits.

Topic catalog, one category per line:
${catalog}`;

const noStore = { 'Cache-Control': 'no-store' };

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q')?.trim().replace(/\s+/g, ' ') ?? '';
  if (!query || query.length > MAX_QUERY_CHARS) {
    return Response.json({ error: `Expected a query of 1 to ${MAX_QUERY_CHARS} characters in ?q=` }, { status: 400, headers: noStore });
  }

  try {
    const { output } = await generateText({
      model: MODEL,
      system: SYSTEM_PROMPT,
      prompt: query,
      output: Output.array({ element: jsonSchema<string>({ type: 'string' }) }),
      // A lookup, not an essay: answer quickly, and bound what one request can cost. (Minimal
      // reasoning was faster but missed most databases for "databases".)
      providerOptions: { openai: { reasoningEffort: 'low' }, anthropic: { effort: 'low' } },
      maxOutputTokens: 4000,
    });
    const topics = [...new Set(output.flatMap(name => topicsByLowercase.get(name.trim().toLowerCase()) ?? []))];
    // The answer depends only on the query, so the CDN can serve repeated searches.
    return Response.json({ topics }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=604800' },
    });
  } catch (error) {
    console.error('Topic search failed:', error);
    return Response.json({ error: 'Semantic search is unavailable' }, { status: 503, headers: noStore });
  }
}
