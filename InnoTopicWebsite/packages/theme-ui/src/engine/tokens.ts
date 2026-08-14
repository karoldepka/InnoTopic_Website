const STYLE_ELEMENT_ID = 'innotopic-theme-ui-tokens'

/**
 * Declares the `transition` that makes color changes - as applyThemeConfig() does - interpolate
 * smoothly instead of snapping instantly. No `@property`/transition existed anywhere in the
 * original Angular app for this; realtime updates come for free from plain CSS custom properties,
 * but *animated* realtime updates needed this transition rule, which is new work rather than a
 * port of existing behavior.
 *
 * Previously also `@property`-registered --ion-color-primary/-secondary/--ion-background-color/
 * --ion-text-color/--color (`syntax: '<color>'`) - that turned out to be unnecessary for this
 * goal (the actual animated targets below are the *standard* color/background-color/etc.
 * properties, which already transition smoothly off any newly-resolved var() value with no typing
 * needed on the custom property feeding them) and actively harmful: a `@property`-registered
 * custom property with `inherits: true` doesn't reliably re-inherit into elements - especially
 * across Shadow DOM, which every Ionic component uses internally - once its value changes after
 * that element's first paint, so it silently falls back to the registration's own initial-value
 * instead (2026-08 incident: --color's initial-value of #000000 meant icons and text across the
 * app - toolbar icons, ion-title, the side-menu's ion-item/ion-label, page headers - all rendered
 * correctly on first load, the one moment nothing had changed yet, then went black-on-dark after
 * any *later* theme change, everywhere at once, exactly matching that failure mode. Removing the
 * registration makes these plain, untyped custom properties again, which inherit through Shadow
 * DOM reliably per ordinary CSS custom-property cascade rules with no such quirk).
 *
 * Injected once into the real document (not a component's shadow root) since these tokens are
 * read globally, by elements across many different shadow trees, not just one component.
 * Idempotent - safe to call from every consumer/component that wants to guarantee it's active.
 */
export function injectThemeTokens(doc: Document = document) {
  if (doc.getElementById(STYLE_ELEMENT_ID)) {
    return
  }

  const style = doc.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.textContent = `
    *, *::before, *::after {
      transition:
        background-color 0.25s ease,
        color 0.25s ease,
        border-color 0.25s ease,
        fill 0.25s ease,
        stroke 0.25s ease;
    }
  `
  doc.head.appendChild(style)
}
