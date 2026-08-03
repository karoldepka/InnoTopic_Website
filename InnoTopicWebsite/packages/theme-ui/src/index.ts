// Stencil discovers @Component-decorated classes under src/ automatically; this file doesn't
// need to re-export them for that to work - it's for the plain engine API instead.
export { themeState, setThemeConfig, initThemeConfig, onThemeStateChange } from './engine/theme-store'
export { applyThemeConfig } from './engine/apply-theme'
export { injectThemeTokens } from './engine/tokens'
export type { ThemeConfigState } from './engine/theme-config-state'
export { defaultThemeConfig } from './engine/theme-config-state'
