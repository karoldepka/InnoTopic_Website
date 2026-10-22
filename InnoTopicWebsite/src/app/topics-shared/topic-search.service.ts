import { computed, Injectable, signal } from '@angular/core';
import { Topic } from '../TopicFriendsShared3/topics-core/Topic';

/** How a topic shows while a search is active: highlighted, muted, or (no search) as usual. */
export type TopicSearchState = 'match' | 'muted' | undefined;

/** Lowercase letters and digits only, so "nextjs" finds "Next.js" and "vue" finds "Vue.js". */
const normalize = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * The page's topic search: topics whose name matches the query are highlighted, every other topic
 * is muted. Topic tags, standalone logos and the topics graph read their state from here.
 */
@Injectable({ providedIn: 'root' })
export class TopicSearchService {
  readonly query = signal('');
  /** Treat the query as a (case-insensitive) regular expression instead of plain text. */
  readonly regex = signal(false);

  /** Tests a topic name; undefined when there is no search, null while the regex is invalid. */
  private readonly matcher = computed<((name: string) => boolean) | undefined | null>(() => {
    const query = this.query();
    if (!query.trim()) return undefined;
    if (this.regex()) {
      try {
        const pattern = new RegExp(query, 'i');
        return name => pattern.test(name);
      } catch {
        return null;
      }
    }
    const needle = normalize(query);
    return needle ? name => normalize(name).includes(needle) : undefined;
  });

  /** An incomplete pattern (e.g. a lone "(") mutes nothing until it parses. */
  readonly invalidRegex = computed(() => this.matcher() === null);
  readonly active = computed(() => !!this.matcher());

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
