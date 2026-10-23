import { computed, effect, Injectable, signal } from '@angular/core';
import { Topic } from '../TopicFriendsShared3/topics-core/Topic';

/** How a topic shows while a search is active: highlighted, muted, or (no search) as usual. */
export type TopicSearchState = 'match' | 'muted' | undefined;

/** Letters and digits only, so "nextjs" finds "Next.js" and "vue" finds "Vue.js". */
const lettersAndDigits = (text: string) => text.replace(/[^\p{L}\p{N}]+/gu, '');
const normalizeName = (name: string) => lettersAndDigits(name.toLowerCase());

/** Wait for a pause in typing before asking the semantic search. */
const SEMANTIC_DEBOUNCE_MS = 400;

/**
 * The page's topic search: topics whose name matches the query are highlighted, every other topic
 * is muted. Topic tags, standalone logos and the topics graph read their state from here.
 */
@Injectable({ providedIn: 'root' })
export class TopicSearchService {
  readonly query = signal('');
  /** Treat the query as a regular expression instead of plain text. */
  readonly regex = signal(false);
  /** Match letter case exactly (plain text and regex alike). */
  readonly caseSensitive = signal(false);
  /**
   * Also highlight the topics the query is about by meaning, as picked by api/topic-search
   * ("databases": MongoDB, PostgreSQL, ...). Name matches show at once; these join when it answers.
   */
  readonly semantic = signal(false);
  /** The semantic search's request for the current query: in flight, or failed. */
  readonly semanticStatus = signal<'idle' | 'loading' | 'error'>('idle');
  /** Normalized names of the topics the semantic search picked for the current query. */
  private readonly semanticMatches = signal<ReadonlySet<string> | undefined>(undefined);
  /** Answers by normalized query, so going back to an earlier query is instant. */
  private readonly semanticCache = new Map<string, ReadonlySet<string>>();

  /** Tests a name; undefined when there is no search, null while the regex is invalid. */
  readonly matcher = computed<((name: string) => boolean) | undefined | null>(() => {
    const query = this.query();
    if (!query.trim()) return undefined;
    const caseSensitive = this.caseSensitive();
    if (this.regex() && !this.semantic()) {
      try {
        const pattern = new RegExp(query, caseSensitive ? '' : 'i');
        return name => pattern.test(name);
      } catch {
        return null;
      }
    }
    const normalize = caseSensitive ? lettersAndDigits : normalizeName;
    const needle = normalize(query);
    const nameMatches = (name: string) => !!needle && normalize(name).includes(needle);
    if (this.semantic()) {
      const semanticMatches = this.semanticMatches();
      return name => nameMatches(name) || !!semanticMatches?.has(normalizeName(name));
    }
    return needle ? nameMatches : undefined;
  });

  /** An incomplete pattern (e.g. a lone "(") mutes nothing until it parses. */
  readonly invalidRegex = computed(() => this.matcher() === null);
  readonly active = computed(() => !!this.matcher());

  constructor() {
    effect(onCleanup => {
      const query = this.query().trim().replace(/\s+/g, ' ').toLowerCase();
      if (!this.semantic() || !query) {
        this.semanticMatches.set(undefined);
        this.semanticStatus.set('idle');
        return;
      }
      const cached = this.semanticCache.get(query);
      this.semanticMatches.set(cached);
      this.semanticStatus.set(cached ? 'idle' : 'loading');
      if (cached) return;

      const request = new AbortController();
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/topic-search?q=${encodeURIComponent(query)}`, { signal: request.signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const { topics } = await response.json() as { topics: string[] };
          const matches = new Set(topics.map(normalizeName));
          this.semanticCache.set(query, matches);
          this.semanticMatches.set(matches);
          this.semanticStatus.set('idle');
        } catch (error) {
          if (request.signal.aborted) return; // superseded by a newer query
          console.warn('Semantic topic search failed:', error);
          this.semanticStatus.set('error');
        }
      }, SEMANTIC_DEBOUNCE_MS);
      onCleanup(() => {
        clearTimeout(timer);
        request.abort();
      });
    });
  }

  matches(topic: Topic | string | undefined | null): boolean {
    const matcher = this.matcher();
    if (!matcher || !topic) return false;
    return matcher(typeof topic === 'string' ? topic : topic.name);
  }

  /** Reactive (reads signals): call it from a computed/template to follow the query. */
  stateOf(topic: Topic | string | undefined | null): TopicSearchState {
    if (!this.active()) return undefined;
    return this.matches(topic) ? 'match' : 'muted';
  }
}
