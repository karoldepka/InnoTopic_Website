// Ported from LifeSuite's theme-config/favicon-theme.service.ts (GH #132) as part of unifying
// LifeSuite's ThemeService/ThemeCalculator into this shared engine - keeps the favicon/tab-chrome
// colors in sync with whatever theme is active, instead of a single static baked icon. A <link>
// favicon can't reference CSS custom properties (it's loaded outside the document's style
// cascade), so this rebuilds the whole SVG as a data URI on every theme change instead.
//
// Safe to call unconditionally from any consumer: every DOM lookup below is a plain
// querySelector/optional-chain that no-ops if the expected <link>/<meta> tags aren't present in
// the host document (e.g. an app that hasn't opted into themed favicons yet).
import { shadeColor } from './color-utils'
import type { ThemeConfigState } from './theme-config-state'

export function updateFavicon(config: ThemeConfigState, doc: Document = document) {
  const background = config.ion_background_color
  // Same shadeColor(_, 0.5) applyThemeConfig() uses elsewhere for a "-tint" variant - keeps this
  // visually matched without re-deriving it from live CSS custom properties (which would tie this
  // function to DOM timing/paint order).
  const primaryTint = shadeColor(config.ion_color_primary, 0.5)
  const secondaryTint = shadeColor(config.ion_color_secondary, 0.5)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110" role="img" aria-label="Themed favicon">
  <rect width="110" height="110" fill="${background}"/>
  <path fill="url(#themedGrad)" d="M41.9761 13C37.092 13 33.041 16.3486 31.8813 20.8733C31.7506 20.8733 31.6526 20.8406 31.5219 20.8406C25.7558 20.8406 21.0677 25.5287 21.0677 31.2948C21.0677 32.0789 21.1657 32.8466 21.3454 33.5817C16.5757 35.5418 13.2271 40.2135 13.2271 45.6693C13.2271 47.7275 13.7498 49.6386 14.5829 51.3701C10.6625 53.6243 8 57.806 8 62.6574C8 68.0968 11.3323 72.7685 16.0693 74.7287C15.9223 75.4801 15.8406 76.2478 15.8406 77.0319C15.8406 83.5331 21.1004 88.7928 27.6016 88.7928C28.2713 88.7928 28.9247 88.7111 29.5618 88.5968C31.1299 93.2522 35.4749 96.6335 40.6693 96.6335C47.1705 96.6335 52.4303 91.3737 52.4303 84.8725V23.4542C52.4303 17.688 47.7422 13 41.9761 13Z"/>
  <path fill="url(#themedGrad)" d="M66.2169 86.35C65.1124 86.35 64.2169 85.4545 64.2169 84.35V25.1636C64.2169 24.0591 65.1124 23.1636 66.2169 23.1636H74.4982C75.6028 23.1636 76.4982 24.0591 76.4982 25.1636V73.5816C76.4982 74.6862 77.3937 75.5816 78.4982 75.5816H100.714C101.819 75.5816 102.714 76.477 102.714 77.5816V84.35C102.714 85.4545 101.819 86.35 100.714 86.35H66.2169Z"/>
  <defs>
    <linearGradient id="themedGrad" x1="55" y1="13" x2="55" y2="96.6335" gradientUnits="userSpaceOnUse">
      <stop stop-color="${primaryTint}"/>
      <stop offset="1" stop-color="${secondaryTint}"/>
    </linearGradient>
  </defs>
</svg>`

  const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`

  const svgLink = doc.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
  if (svgLink) {
    svgLink.href = dataUri
  }

  const maskLink = doc.querySelector<HTMLLinkElement>('link[rel="mask-icon"]')
  if (maskLink) {
    maskLink.setAttribute('color', config.ion_color_primary)
  }

  // Browser chrome (mobile status bar, Android task switcher, pinned-tab background) - same
  // "match the theme" intent as the favicon itself.
  doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', background)
  doc.querySelector<HTMLMetaElement>('meta[name="msapplication-TileColor"]')
    ?.setAttribute('content', background)
}
