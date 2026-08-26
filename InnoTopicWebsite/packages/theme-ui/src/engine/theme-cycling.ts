// Ported from LifeSuite's theme-config/theme.service.ts (the themes/randomThemes getters and
// applyRandomTheme()/applyNextTheme()) as part of unifying LifeSuite's ThemeService into this
// shared engine. Operates over theme-presets.ts's merged array (hand-authored + curatedThemes),
// so both apps share one eligible-theme pool.
import { setThemeConfig, themeState } from './theme-store'
import { themePresets, ThemePreset } from './theme-presets'

export interface ThemeCyclingOptions {
  /** Off by default - matches LifeSuite's environment.showExperimentalThemes gate, which callers
   * (e.g. a settings page reading its own app's env config) are expected to pass through
   * explicitly rather than this package assuming a default. */
  includeExperimental?: boolean
}

/** disabled presets are excluded everywhere (picker, next, random) - "known-broken", not a live
 * choice. experimental presets are further gated behind includeExperimental. */
export function eligiblePresets(options: ThemeCyclingOptions = {}): ThemePreset[] {
  return themePresets.filter(preset => {
    if (preset.disabled) return false
    if (preset.experimental && !options.includeExperimental) return false
    return true
  })
}

/** Same as eligiblePresets(), minus anything explicitly marked excludeFromRandom (shown in picker
 * UIs, but not a good "surprise me" pick - e.g. intentionally jarring high-contrast presets). */
export function randomizablePresets(options: ThemeCyclingOptions = {}): ThemePreset[] {
  return eligiblePresets(options).filter(preset => !preset.excludeFromRandom)
}

/** Finds the preset matching the current live color state, if any - a freeform edit (via
 * theme-configurator) won't match any preset, which is expected (returns undefined). Mirrors the
 * generated <theme-selector>'s own activePresetName getter. */
export function findActivePreset(presets: ThemePreset[] = themePresets): ThemePreset | undefined {
  return presets.find(preset =>
    preset.config.ion_background_color === themeState.ion_background_color &&
    preset.config.ion_color_primary === themeState.ion_color_primary &&
    preset.config.ion_color_secondary === themeState.ion_color_secondary
  )
}

/** Applies a preset's colors/shadow/corners/icon while preserving global brightness and font-size
 * controls. This is the one place "pick this preset" should go through, rather than calling
 * setThemeConfig(preset.config) directly. */
export function applyPreset(preset: ThemePreset) {
  setThemeConfig({
    ...preset.config,
    brightness_percent: themeState.brightness_percent,
    font_size_percent: themeState.font_size_percent,
  })
}

function pickRandomFrom(presets: ThemePreset[]): ThemePreset {
  const index = Math.floor(Math.min(Math.random(), 0.999) * presets.length)
  return presets[index]
}

/** Applies a random eligible preset, avoiding repeating the currently-active one when more than
 * one choice exists. */
export function applyRandomTheme(options?: ThemeCyclingOptions) {
  const presets = randomizablePresets(options)
  if (presets.length === 0) return
  if (presets.length === 1) {
    applyPreset(presets[0])
    return
  }
  const current = findActivePreset(presets)
  let next = pickRandomFrom(presets)
  while (next === current) {
    next = pickRandomFrom(presets)
  }
  applyPreset(next)
}

/** Applies the next eligible preset after the currently-active one (wrapping around) - unlike
 * applyRandomTheme(), this does NOT exclude excludeFromRandom presets, matching LifeSuite's
 * original applyNextTheme() (which cycled over `themes`, not `randomThemes`). */
export function applyNextTheme(options?: ThemeCyclingOptions) {
  const presets = eligiblePresets(options)
  if (presets.length === 0) return
  const currentIndex = presets.findIndex(preset => preset === findActivePreset(presets))
  const nextIndex = (currentIndex + 1) % presets.length
  applyPreset(presets[nextIndex])
}
