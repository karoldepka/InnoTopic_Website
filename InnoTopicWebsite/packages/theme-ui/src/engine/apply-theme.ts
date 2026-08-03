import { getIonicTextColor } from './color-utils'
import { setIonicColorSteps, setIonicColorVarHexAndRgb } from './ionic-color-utils'
import { adjustLuminance } from './adjust-luminance'
import type { ThemeConfigState } from './theme-config-state'

/**
 * Ported from Angular's theme-config.effects.ts (the updateThemeConfig$ tap() body) - it was
 * already 100% framework-agnostic imperative setProperty() calls there, just wrapped in an
 * NgRx effect. Takes the full desired state rather than a partial action patch: every real
 * caller in the original app (theme-list's preset click, theme-config's form valueChanges)
 * already dispatched the complete 6-field object, so this is a direct behavioral match, not
 * a narrowing.
 *
 * One bug fixed while porting: the original's shade/tint `color-mix(...)` values were missing
 * their closing paren (`` `color-mix(in srgb, var(${varName}) 75%, black` `` - no `)`), which
 * is invalid CSS silently rejected by the browser - the shade/tint tokens never actually worked
 * in the original app. Fixed here rather than reproduced, per the "fix it properly" call already
 * made for topic-tag's CSS encapsulation.
 */
export function applyThemeConfig(config: ThemeConfigState) {
  const root = document.documentElement.style

  for (const [key, value] of Object.entries(config)) {
    const varName = `--${key.replace(/_/g, '-')}`
    const needsPxSuffix = varName.startsWith('--shadow') || varName.startsWith('--corner-radius')
    const val = needsPxSuffix ? `${value}px` : String(value)
    root.setProperty(varName, val)
    root.setProperty(`${varName}-shade`, `color-mix(in srgb, var(${varName}) 75%, black)`)
    root.setProperty(`${varName}-tint`, `color-mix(in srgb, var(${varName}) 75%, white)`)
  }

  // Convenience shorthand so consumers can do `border-radius: var(--corner-radius)` in one
  // declaration instead of naming all four longhands.
  root.setProperty('--corner-radius', [
    `${config.corner_radius_top_left}px`,
    `${config.corner_radius_top_right}px`,
    `${config.corner_radius_bottom_right}px`,
    `${config.corner_radius_bottom_left}px`,
  ].join(' '))

  /* FIXME: shadows should be based on luminance increase/decrease, instead of opacity which is
     like mixing; e.g. white is much farther away from dark bg, than black - noted as-is from
     the original, not something this port is trying to redesign. */
  const shadowLumAdjust = config.shadow_opacity / 100
  root.setProperty('--shadow-light-color', adjustLuminance(config.ion_background_color, shadowLumAdjust))
  root.setProperty('--shadow-dark-color', adjustLuminance(config.ion_background_color, -shadowLumAdjust))
  root.setProperty('--ion-item-border-color', 'var(--ion-color-step-100)')

  const contrastValue = 'high'
  const textFg = getIonicTextColor(config.ion_background_color, contrastValue)
  root.setProperty('--ion-text-color', textFg)
  root.setProperty('--color', textFg)
  setIonicColorSteps(textFg)

  setIonicColorVarHexAndRgb(root, '--ion-color-primary-contrast', getIonicTextColor(config.ion_color_primary, contrastValue))
  setIonicColorVarHexAndRgb(root, '--ion-color-secondary-contrast', getIonicTextColor(config.ion_color_secondary, contrastValue))

  root.setProperty('--chip-shadow-margin',
    Number(config.shadow_blur_radius) / 4 + Math.abs(Number(config.shadow_offset)) + 2 + 'px')
}
