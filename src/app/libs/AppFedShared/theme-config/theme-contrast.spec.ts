import {describe, it, expect} from 'vitest'
import {themesArray} from './themes.data'
import {shadeColor, contrastRatio, colorDistance, MIN_UI_CONTRAST, MIN_COLOR_DISTANCE} from './color-utils'

/** Validates every non-disabled theme's primary/secondary actually stand out against its own
 * background, at the default brightness (50%) ThemeCalculator.updateColors() computes it at -
 * a color can individually read fine against black/white text (ThemeCalculator's own per-color
 * contrast check) while still being too close to the *background* to be legible as a button/icon
 * color sitting on it. WCAG's 3:1 "UI component" threshold (not the stricter 4.5:1 body-text one -
 * these are buttons/icons, not paragraphs) - see color-utils.contrastRatio's doc comment. */
describe('theme background/primary/secondary contrast', () => {
  for (const theme of themesArray) {
    if (theme.disabled) {
      continue // already known-broken and excluded from selection - not this test's concern
    }
    // Same computation ThemeCalculator.updateColors() does at the default 50% brightness slider.
    const background = shadeColor(theme.background || '#101010', 50 / 75)

    it(`"${theme.id}": primary is legible against its background`, () => {
      expect(contrastRatio(theme.primary, background)).toBeGreaterThanOrEqual(MIN_UI_CONTRAST)
    })

    it(`"${theme.id}": secondary is legible against its background`, () => {
      expect(contrastRatio(theme.secondary, background)).toBeGreaterThanOrEqual(MIN_UI_CONTRAST)
    })
  }
})

/** GH: "the themes cannot have a similar primary&secondary color, because secondary is used to
 * distinguish things like a button/selector being selected" - primary and secondary are used
 * side-by-side to convey UI state (e.g. TimerPresetComponent's selected-vs-unselected preset), so
 * beyond each individually contrasting against the background (above), they must also be clearly
 * distinguishable from *each other*. contrastRatio() alone can't catch this (it's luminance-only,
 * so e.g. pure red and pure blue at matched lightness can read as "high contrast" while looking
 * like two shades of the same color) - colorDistance()'s perceptual deltaE is what actually
 * matches "would a person glancing at these two buttons tell them apart". */
describe('theme primary/secondary distinctness', () => {
  for (const theme of themesArray) {
    if (theme.disabled) {
      continue
    }

    it(`"${theme.id}": primary and secondary are visually distinct from each other`, () => {
      expect(colorDistance(theme.primary, theme.secondary)).toBeGreaterThanOrEqual(MIN_COLOR_DISTANCE)
    })
  }
})
