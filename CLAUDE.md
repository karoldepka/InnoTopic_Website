# Styling & layout conventions

Observed conventions in this codebase - follow them for consistency rather than introducing a new pattern per component.

- **Syntax**: component styles are `.sass` (indented, no braces/semicolons), not `.scss`. `global.scss` (braces syntax) is the one shared/global exception.
- **Component root layout**: put the component's own flex/grid layout on a `:host` block at the top of the file, not on a wrapper `<div>` inside the template.
- **Spacing between siblings**: prefer `gap` on the flex/grid container over per-child `margin`. Margins are the exception, not the default, in this codebase.
- **Colors**: always via CSS custom properties, never hardcoded hex/named colors - `var(--ion-color-primary)`, `var(--ion-text-color)`, `var(--ion-border-color)`, etc. When a fallback is useful (e.g. the var might not be set in some embed context), provide one: `var(--ion-border-color, rgba(0, 0, 0, 0.1))`.
- **This app is dark-mode only** (`html { color-scheme: dark }` in `global.scss`) - there is no light theme to also check, but don't assume "dark" means every neutral surface can just be near-black/near-white:
  - `--ion-color-light` is a **fixed near-white regardless of theme** (`#f4f5f8`) - using it as a background (e.g. a hover/filled state) puts a near-white surface under this app's light/white text, which is nearly invisible. This was a real, shipped bug (GH #139-adjacent contrast fixes, 2026-08-02) in three separate components before being caught.
  - For a subtle, theme-aware neutral surface (hover states, subtle fills, dividers), use the `--ion-color-step-*` scale instead (`--ion-color-step-50` darkest … `--ion-color-step-950` lightest, defined in `src/theme/dark_orange_blue.scss`). `--ion-color-step-150` is the usual choice for a "just slightly lighter than the background" hover/highlight.
  - When adding any new hover/active/selected background, sanity-check the resulting text-on-background contrast before considering it done - don't just trust that "it's a themed color, so it must be fine."
- **Shared box-model for repeated small UI elements** (pills/chips, etc.): centralize the shape (padding, border-radius, font, opacity) in a shared class in `global.scss` and reuse it from each component, rather than each component redefining the same box model independently and silently drifting apart over time. See `.slot-pill` in `global.scss` for the pattern.
- **Compact paddings**: this app favors tight, small paddings for its dense list/cell UI - typical values are `4px 8px`, `4px 10px`, `2px 8px`, not generous whitespace. Match the density of the surrounding component rather than defaulting to a larger, more "spacious" padding.
- **Pills/chips**: `border-radius: 999px` for fully-rounded pill shapes.
