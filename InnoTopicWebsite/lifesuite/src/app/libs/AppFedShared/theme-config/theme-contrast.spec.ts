import {describe, it, expect} from 'vitest'
import {themePresets, shadeColor, contrastRatio, colorDistance, MIN_UI_CONTRAST, MIN_COLOR_DISTANCE} from '@innotopic/theme-ui-angular'

/** GH: two hand-authored presets (Ocean Midnight/Ocean Light's old cyan-on-blue secondary, Yellow
 * Midnight's old orange-on-yellow secondary) shipped with a primary/secondary that read as the
 * same color at a glance - themePresets.ts's hand-authored entries were never covered by this
 * file (only curatedThemes was), so nothing caught it. Iterating the full themePresets (hand-
 * authored + curatedThemes, see theme-presets.ts) instead closes that gap for both checks below. */
const presetsUnderTest = themePresets

/** Validates every non-disabled theme's primary/secondary actually stand out against its own
 * background, at the default brightness (50%) applyThemeConfig() computes it at - a color can
 * individually read fine against black/white text (getIonicTextColor's own per-color contrast
 * check) while still being too close to the *background* to be legible as a button/icon color
 * sitting on it. WCAG's 3:1 "UI component" threshold (not the stricter 4.5:1 body-text one - these
 * are buttons/icons, not paragraphs) - see color-utils.contrastRatio's doc comment.
 *
 * Lives in LifeSuite (not packages/theme-ui) because this is where LifeSuite's curated theme list
 * originated and where its own vitest setup already runs it (see vitest.config.ts) - the list
 * itself now lives in @innotopic/theme-ui/src/engine/curated-themes.ts, shared with
 * InnoTopicWebsite too. */
describe('theme preset background/primary/secondary contrast', () => {
  for (const theme of presetsUnderTest) {
    if (theme.disabled) {
      continue // already known-broken and excluded from selection - not this test's concern
    }
    // Same computation applyThemeConfig() does at the default 50% brightness slider.
    const background = shadeColor(theme.config.ion_background_color, 50 / 75)

    it(`"${theme.name}": primary is legible against its background`, () => {
      expect(contrastRatio(theme.config.ion_color_primary, background)).toBeGreaterThanOrEqual(MIN_UI_CONTRAST)
    })

    it(`"${theme.name}": secondary is legible against its background`, () => {
      expect(contrastRatio(theme.config.ion_color_secondary, background)).toBeGreaterThanOrEqual(MIN_UI_CONTRAST)
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
describe('theme preset primary/secondary distinctness', () => {
  for (const theme of presetsUnderTest) {
    if (theme.disabled) {
      continue
    }
    // Neumorphism is deliberately a low-contrast, near-monochrome "everything pressed out of the
    // same slab" look (see its own comment in theme-presets.ts) - unlike every other preset here,
    // barely-distinguishable primary/secondary is the intended aesthetic, not a bug.
    if (theme.name === 'Neumorphism') {
      continue
    }

    it(`"${theme.name}": primary and secondary are visually distinct from each other`, () => {
      expect(colorDistance(theme.config.ion_color_primary, theme.config.ion_color_secondary)).toBeGreaterThanOrEqual(MIN_COLOR_DISTANCE)
    })
  }
})
