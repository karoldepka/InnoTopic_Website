import { createStore } from '@stencil/store'
import { applyThemeConfig } from './apply-theme'
import { updateFavicon } from './favicon-theme'
import { defaultThemeConfig, ThemeConfigState } from './theme-config-state'

const STORAGE_KEY = 'theme_config'
const PERSIST_THROTTLE_MS = 1000

function loadPersistedThemeConfig(): Partial<ThemeConfigState> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

const { state, onChange } = createStore<ThemeConfigState>({
  ...defaultThemeConfig,
  ...loadPersistedThemeConfig(),
})

/** Single source of truth for theme state - replaces the Angular app's NgRx `themeConfig` slice. */
export const themeState = state

/** Exposed so components (e.g. theme-selector/theme-configurator) can subscribe and re-render. */
export { onChange as onThemeStateChange }

let applyScheduled = false
let lastPersistAt = 0
let persistTimer: ReturnType<typeof setTimeout> | undefined

function persistThrottled() {
  const now = Date.now()
  const elapsed = now - lastPersistAt
  const doPersist = () => {
    lastPersistAt = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
  if (elapsed >= PERSIST_THROTTLE_MS) {
    doPersist()
  } else {
    clearTimeout(persistTimer)
    persistTimer = setTimeout(doPersist, PERSIST_THROTTLE_MS - elapsed)
  }
}

function scheduleApply() {
  // Batches a multi-field update (e.g. clicking a whole preset) into a single apply pass
  // instead of recomputing derived tokens once per changed field.
  if (applyScheduled) return
  applyScheduled = true
  queueMicrotask(() => {
    applyScheduled = false
    applyThemeConfig(state)
    updateFavicon(state)
    persistThrottled()
  })
}

;(Object.keys(defaultThemeConfig) as (keyof ThemeConfigState)[]).forEach(key => {
  onChange(key, scheduleApply)
})

/** Patch one or more fields; batched application + throttled persistence happen automatically. */
export function setThemeConfig(patch: Partial<ThemeConfigState>) {
  Object.assign(state, patch)
}

/** Applies the current (default, persisted, or already-live) state immediately - safe to call any
 * number of times, not just once on startup. Re-reads localStorage first rather than trusting
 * `state` as-is: consumers built as a separate bundle (e.g. <theme-configurator>'s
 * dist-custom-elements build vs. this package's main dist, both compiled from this same source -
 * see theme-ui-angular's ThemeUiService doc comment) get their own independent module-scoped copy
 * of `state`, created whenever THAT bundle first evaluates - which can be well before anything
 * else on the page has ever persisted a theme. Without re-reading here, a bundle whose `state` was
 * born before the first persist would keep re-applying its own stale/default snapshot forever,
 * every time one of its components (re)connects, even though localStorage - the one thing every
 * bundle actually shares - has long since had the real, current theme (2026-08 incident: opening
 * LifeSuite's theme popover, which mounts a fresh <theme-configurator>, visually reset the whole
 * app to this engine's hardcoded defaults). */
export function initThemeConfig() {
  const persisted = loadPersistedThemeConfig()
  if (persisted) {
    Object.assign(state, persisted)
  }
  applyThemeConfig(state)
}
