import { getIonicTextColor, shadeColor, hexToRgb } from './color-utils'
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

/** Ionic's own "-rgb" suffix convention (bare "r, g, b", for rgba(var(--x-rgb), alpha)) - see
 * setIonicColorVarHexAndRgb's doc comment for why this isn't just hexToRgb() directly. */
function bareRgbTriplet(hex: string): string {
  return hexToRgb(hex).slice(4, -1)
}

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
  // Ionic's own "-rgb" companion for --ion-text-color, same convention as -primary-rgb/
  // -secondary-rgb below - several components rely on this for a text-color-tinted translucent
  // border/background (rgba(var(--ion-text-color-rgb, 255, 255, 255), alpha)) that reads fine on
  // a dark theme's fallback (opaque white) but was invisible/wrong on any light theme before this
  // was ever set.
  root.setProperty('--ion-text-color-rgb', bareRgbTriplet(textFg))
  setIonicColorSteps(textFg)

  setIonicColorVarHexAndRgb(root, '--ion-color-primary-contrast', getIonicTextColor(config.ion_color_primary, contrastValue))
  setIonicColorVarHexAndRgb(root, '--ion-color-secondary-contrast', getIonicTextColor(config.ion_color_secondary, contrastValue))

  // Ionic's own "-rgb" companion for the primary/secondary colors themselves (the generic loop
  // above only sets the hex form) - needed by any rgba(var(--ion-color-primary-rgb), alpha) usage.
  root.setProperty('--ion-color-primary-rgb', bareRgbTriplet(config.ion_color_primary))
  root.setProperty('--ion-color-secondary-rgb', bareRgbTriplet(config.ion_color_secondary))

  // Ported from LifeSuite's ThemeCalculator.setColorProps() - two bugs fixed while porting rather
  // than reproduced (same "fix it properly" call as the shade/tint color-mix() paren bug above):
  // the original's --ion-color-{name}-highlight was missing its closing paren (so, like shade/
  // tint, never actually worked) AND was hardcoded to reference primary's own tint/shade
  // regardless of `colorName` (so secondary's "highlight" would have pointed at primary's color,
  // not its own, once the paren bug was fixed). isDarkTheme was likewise hardcoded `true` (never
  // actually toggled) - kept as unconditional tint here, matching that always-true behavior.
  root.setProperty('--ion-color-primary-highlight', 'var(--ion-color-primary-tint)')
  root.setProperty('--ion-color-secondary-highlight', 'var(--ion-color-secondary-tint)')

  // Ported from LifeSuite's ThemeCalculator.setColorProps() - "workaround for logo disappearing
  // on page navigation" per its own comment (AppLogoComponent's gradient, and a handful of other
  // translucent-accent usages like tree-node border colors). Derived from the same raw
  // config.ion_color_primary/secondary the generic loop above sets as --ion-color-primary/
  // -secondary (not a brightness-shaded "central" color like the original's - this engine doesn't
  // shade primary/secondary by brightness at all, only background/item-background).
  root.setProperty('--ion-color-primary-contrast-muted', config.ion_color_primary + '80')
  root.setProperty('--ion-color-secondary-contrast-muted', config.ion_color_secondary + '80')

  // NOT setting bare --primary/--secondary here (LifeSuite's ThemeCalculator did) - LifeSuite's
  // own global.scss already aliases them to var(--ion-color-primary)/var(--ion-color-secondary),
  // which this function already keeps reactive, so a JS-side setProperty here would just be a
  // redundant second way of doing the same thing.

  root.setProperty('--chip-shadow-margin',
    Number(config.shadow_blur_radius) / 4 + Math.abs(Number(config.shadow_offset)) + 2 + 'px')
}
