import {describe, it, expect} from 'vitest'
import {themesArray} from './themes.data'
import {shadeColor, contrastRatio} from './color-utils'

/** Validates every non-disabled theme's primary/secondary actually stand out against its own
 * background, at the default brightness (50%) ThemeCalculator.updateColors() computes it at -
 * a color can individually read fine against black/white text (ThemeCalculator's own per-color
 * contrast check) while still being too close to the *background* to be legible as a button/icon
 * color sitting on it. WCAG's 3:1 "UI component" threshold (not the stricter 4.5:1 body-text one -
 * these are buttons/icons, not paragraphs) - see color-utils.contrastRatio's doc comment. */
describe('theme background/primary/secondary contrast', () => {
  const MIN_UI_CONTRAST = 3

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
