const STYLE_ELEMENT_ID = 'innotopic-theme-ui-tokens'

/**
 * Registers the core color tokens via the CSS Properties and Values API (`@property`) so
 * changing their value - as applyThemeConfig() does - actually interpolates instead of
 * snapping instantly, then declares the `transition` that makes that interpolation visible.
 * No `@property`/transition existed anywhere in the original Angular app for this; realtime
 * updates come for free from plain CSS custom properties, but *animated* realtime updates
 * needed this registration step, which is new work rather than a port of existing behavior.
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
    @property --ion-color-primary { syntax: '<color>'; inherits: true; initial-value: #007bff; }
    @property --ion-color-secondary { syntax: '<color>'; inherits: true; initial-value: #6c757d; }
    @property --ion-background-color { syntax: '<color>'; inherits: true; initial-value: #ffffff; }
    @property --ion-text-color { syntax: '<color>'; inherits: true; initial-value: #000000; }
    @property --color { syntax: '<color>'; inherits: true; initial-value: #000000; }

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
