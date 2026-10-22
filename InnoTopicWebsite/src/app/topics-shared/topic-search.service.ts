import { computed, Injectable, signal } from '@angular/core';
import { Topic } from '../TopicFriendsShared3/topics-core/Topic';

/** How a topic shows while a search is active: highlighted, muted, or (no search) as usual. */
export type TopicSearchState = 'match' | 'muted' | undefined;

/** Lowercase letters and digits only, so "nextjs" finds "Next.js" and "vue" finds "Vue.js". */
const normalize = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * The page's topic search: topics whose name contains the query are highlighted, every other topic
 * is muted. Topic tags, standalone logos and the topics graph read their state from here.
 */
@Injectable({ providedIn: 'root' })
export class TopicSearchService {
  readonly query = signal('');
  private readonly needle = computed(() => normalize(this.query()));
  readonly active = computed(() => this.needle().length > 0);

  matches(topic: Topic | string | undefined | null): boolean {
    const needle = this.needle();
    if (!needle || !topic) return false;
    const name = typeof topic === 'string' ? topic : topic.name;
    return normalize(name).includes(needle);
  }

  /** Reactive (reads signals): call it from a computed/template to follow the query. */
  stateOf(topic: Topic | string | undefined | null): TopicSearchState {
    if (!this.active()) return undefined;
    return this.matches(topic) ? 'match' : 'muted';
  }
}
