// Ported from the Angular app's src/app/models/theme-config-state.model.ts, extended with
// per-corner radius fields (independently configurable, defaulting to today's topic-chip
// look - see the "corner_radius_*" defaults below matching its hardcoded `20px 7px`) and
// icon_brightness/icon_contrast, which feed @innotopic/svg-conversion's Rust/Wasm icon
// recoloring (topic-logo's recolor-contrast/recolor-brightness properties) rather than any
// CSS-level effect - their ranges match that crate's process_svg_with_palette exactly (contrast
// 0..2, 1 neutral; brightness -1..1, 0 neutral).
export interface ThemeConfigState {
  ion_color_primary: string;
  ion_color_secondary: string;
  ion_background_color: string;
  shadow_offset: string;
  shadow_blur_radius: string;
  shadow_opacity: number;
  corner_radius_top_left: string;
  corner_radius_top_right: string;
  corner_radius_bottom_right: string;
  corner_radius_bottom_left: string;
  icon_contrast: number;
  icon_brightness: number;
}

export const defaultThemeConfig: ThemeConfigState = {
  ion_color_primary: '#007bff',
  ion_color_secondary: '#6c757d',
  ion_background_color: '#ffffff',
  shadow_offset: '5',
  shadow_blur_radius: '10',
  shadow_opacity: 50,
  // Matches the neumorphic-chip's original hardcoded `border-radius: 20px 7px` exactly, so the
  // default theme is a visual no-op for existing chips until someone actually changes a preset.
  corner_radius_top_left: '20',
  corner_radius_top_right: '7',
  corner_radius_bottom_right: '20',
  corner_radius_bottom_left: '7',
  icon_contrast: 1,
  icon_brightness: 0,
}
