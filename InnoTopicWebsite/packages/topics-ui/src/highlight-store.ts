import { ReactiveValue } from './reactive-value'

/** Replaces Angular's HighlightService (a signal + setHighlight()) - same shape, no DI needed. */
export const highlightedId = new ReactiveValue<string | undefined>(undefined)

export function setHighlight(id: string | undefined) {
  highlightedId.set(id)
}
