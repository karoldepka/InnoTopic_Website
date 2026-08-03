/**
 * Minimal observable value, standing in for the one Angular signal() each of TopicsService/
 * HighlightService used purely as a "something changed, please re-render" notification.
 * Lit components subscribe from connectedCallback() and call requestUpdate() (or update a
 * local @state field) from the listener; unsubscribe in disconnectedCallback().
 */
export class ReactiveValue<T> {
  #value: T
  #listeners = new Set<(value: T) => void>()

  constructor(initial: T) {
    this.#value = initial
  }

  get value(): T {
    return this.#value
  }

  set(value: T) {
    this.#value = value
    this.#listeners.forEach(listener => listener(value))
  }

  subscribe(listener: (value: T) => void): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }
}
