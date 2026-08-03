import {errorAlert} from "./log";

export function ignorePromise(_promise: Promise<any>, what?: string) {
  _promise.catch(error => {
    errorAlert('Promise error', error, 'while doing', what)
  })
}

/** Runs at most `limit` `fn`s concurrently; further calls queue until a slot frees up.
 * Needed anywhere a burst of items (e.g. a full-collection load) triggers one network/IO
 * call per item - without this, thousands of simultaneous `fetch()`s exhaust the browser's
 * connection pool (`net::ERR_INSUFFICIENT_RESOURCES`) and silently fail past that point. */
export class ConcurrencyLimiter {
  private active = 0
  private queue: Array<() => void> = []

  constructor(private readonly limit: number) {
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>(resolve => this.queue.push(resolve))
    }
    this.active++
    try {
      return await fn()
    } finally {
      this.active--
      this.queue.shift()?.()
    }
  }
}
