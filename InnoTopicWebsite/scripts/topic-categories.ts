/**
 * Every topic's name, grouped by category, for the semantic topic search (api/topic-search.ts).
 * Bundled and run by generate-api-data.mjs, which writes the result to api/_topic-categories.ts.
 */
import { topicCategoriesArray } from '../src/app/TopicFriendsShared3/topics-core/topics-data';

export interface TopicCategoryNames {
  category: string;
  topics: string[];
}

export function topicCategories(): TopicCategoryNames[] {
  // A category's topicsById is keyed by topic name (see processTopics).
  return topicCategoriesArray.map(category => ({
    category: category.name,
    topics: Object.keys(category.topicsById),
  }));
}
