import { getIonicTextColor, shadeColor } from './color-utils'
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
 *
 * brightness_percent (ported from LifeSuite's ThemeCalculator) shades ion_background_color before
 * anything derives from it below - see shadedBackground.
 */
export function applyThemeConfig(config: ThemeConfigState) {
  const root = document.documentElement.style

  // brightness_percent is a control input, not itself a themed color/size token - skip it here so
  // it doesn't get a nonsensical `--brightness-percent` var (plus -shade/-tint color-mix() of a
  // bare number, which is invalid CSS the browser silently drops).
  for (const [key, value] of Object.entries(config)) {
    if (key === 'brightness_percent') continue
    const varName = `--${key.replace(/_/g, '-')}`
    const needsPxSuffix = varName.startsWith('--shadow') || varName.startsWith('--corner-radius')
    const val = needsPxSuffix ? `${value}px` : String(value)
    root.setProperty(varName, val)
    root.setProperty(`${varName}-shade`, `color-mix(in srgb, var(${varName}) 75%, black)`)
    root.setProperty(`${varName}-tint`, `color-mix(in srgb, var(${varName}) 75%, white)`)
  }

  // Ported from ThemeCalculator.updateColors(): brightness_percent / 75 is the shadeColor()
  // "neutral point" (decimal 1 = no change) - see theme-config-state.ts's doc comment on the
  // field's default. Overrides the raw (unshaded) --ion-background-color the loop above just set.
  const shadedBackground = shadeColor(config.ion_background_color, config.brightness_percent / 75)
  root.setProperty('--ion-background-color', shadedBackground)
  // Ported from ThemeCalculator.updateColors()'s itemAndTextBg - a second, slightly lighter shade
  // for items/cards sitting on top of the background.
  root.setProperty('--ion-item-background', shadeColor(shadedBackground, config.brightness_percent / 85))

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
  root.setProperty('--shadow-light-color', adjustLuminance(shadedBackground, shadowLumAdjust))
  root.setProperty('--shadow-dark-color', adjustLuminance(shadedBackground, -shadowLumAdjust))
  root.setProperty('--ion-item-border-color', 'var(--ion-color-step-100)')

  const contrastValue = 'high'
  const textFg = getIonicTextColor(shadedBackground, contrastValue)
  root.setProperty('--ion-text-color', textFg)
  root.setProperty('--color', textFg)
  setIonicColorSteps(textFg)

  setIonicColorVarHexAndRgb(root, '--ion-color-primary-contrast', getIonicTextColor(config.ion_color_primary, contrastValue))
  setIonicColorVarHexAndRgb(root, '--ion-color-secondary-contrast', getIonicTextColor(config.ion_color_secondary, contrastValue))

  root.setProperty('--chip-shadow-margin',
    Number(config.shadow_blur_radius) / 4 + Math.abs(Number(config.shadow_offset)) + 2 + 'px')
}
