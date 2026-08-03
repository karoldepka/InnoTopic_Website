
export type DateFormats = string


/**
 * Richer, opt-in info about a handful of topics: a one-line tagline, a longer description,
 * and the year the topic was first released. Shown in the topic tag's click-to-info popover
 * (see TopicsService.getTopicInfo), on top of the shorter blurbs in topic-info.data.ts.
 *
 * Kept separate from topics-data.ts (per #1, same rationale as topic-info.data.ts) so that
 * adding/editing this doesn't require touching the already-huge topic definition file.
 * Keyed by Topic.id (falls back to Topic.name); keys are checked against real topic names,
 * but this is only ever a subset, not every topic needs an entry.
 */

export interface TopicExtendedInfo {
  tagline?: string;
  website?: string;
  githubRepo?: string;
  wikipediaEntry?: string;
  description?: string;
  whenFirstReleased?: DateFormats;
  byUser?: {
    whenIStartedUsing: DateFormats;
  };
}
