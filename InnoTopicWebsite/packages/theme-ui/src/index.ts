// Stencil discovers @Component-decorated classes under src/ automatically; this file doesn't
// need to re-export them for that to work - it's for the plain engine API instead.
export { themeState, setThemeConfig, initThemeConfig, onThemeStateChange } from './engine/theme-store'
export { applyThemeConfig } from './engine/apply-theme'
export { injectThemeTokens } from './engine/tokens'
export type { ThemeConfigState } from './engine/theme-config-state'
export { defaultThemeConfig } from './engine/theme-config-state'
export { themePresets } from './engine/theme-presets'
export type { ThemePreset } from './engine/theme-presets'
export { curatedThemes } from './engine/curated-themes'
export {
  eligiblePresets,
  randomizablePresets,
  findActivePreset,
  applyPreset,
  applyRandomTheme,
  applyNextTheme,
} from './engine/theme-cycling'
export type { ThemeCyclingOptions } from './engine/theme-cycling'
export { updateFavicon } from './engine/favicon-theme'
export {
  shadeColor,
  getRgbColorFromHex,
  relativeLuminance,
  contrastRatio,
  colorDistance,
  MIN_UI_CONTRAST,
  MIN_COLOR_DISTANCE,
} from './engine/color-utils'
export type { RGB } from './engine/color-utils'
