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
  // Inset counterpart to shadow_offset/shadow_blur_radius/shadow_opacity above - same geometry
  // knobs, independently configurable, rendered as an `inset` box-shadow layer alongside (not
  // instead of) the outer one. Lets a consumer combine "raised" (outer) and "pressed in" (inner)
  // cues the way physical neumorphic UI usually does, rather than only ever offering one or the
  // other. See applyThemeConfig() for how these become --inner-shadow-* CSS vars.
  inner_shadow_offset: string;
  inner_shadow_blur_radius: string;
  inner_shadow_opacity: number;
  corner_radius_top_left: string;
  corner_radius_top_right: string;
  corner_radius_bottom_right: string;
  corner_radius_bottom_left: string;
  /** Use the primary color alone, or interpolate from primary to secondary. */
  icon_color_mode: 'palette' | 'primary_contrast';
  icon_contrast: number;
  icon_brightness: number;
  // Ported from LifeSuite's ThemeService/ThemeCalculator (theme-config/theme.service.ts) as part
  // of unifying the two apps' previously-separate theming systems onto this one engine. Shades
  // ion_background_color (and the derived ion_item_background) via shadeColor() in color-utils.ts
  // - see applyThemeConfig() for the actual math. 75 is the *neutral* value for shadeColor's
  // divide-by-decimal algorithm (decimal = brightness_percent / 75, so 75 => decimal 1 => no-op),
  // deliberately chosen as the default so existing theme-ui presets stay visually unchanged for
  // consumers that never touch this field. LifeSuite's own brightness slider defaults to 50
  // (visibly brighter than a preset's raw background) - that's set explicitly at LifeSuite
  // startup, not by changing this shared default.
  brightness_percent: number;
  /** Root text size as a percentage of the browser's default, shared by all theme consumers. */
  font_size_percent: number;
  /** Default Ionic icon size relative to its surrounding text. */
  icon_size_percent: number;
}

export const defaultThemeConfig: ThemeConfigState = {
  ion_color_primary: '#007bff',
  ion_color_secondary: '#6c757d',
  ion_background_color: '#ffffff',
  shadow_offset: '1',
  shadow_blur_radius: '3',
  shadow_opacity: 16,
  // The standard surface keeps its inset layer disabled, while retaining the tuned geometry so
  // enabling it later starts from the same balanced direction and blur.
  inner_shadow_offset: '-6',
  inner_shadow_blur_radius: '4',
  inner_shadow_opacity: 0,
  corner_radius_top_left: '12',
  corner_radius_top_right: '12',
  corner_radius_bottom_right: '12',
  corner_radius_bottom_left: '12',
  icon_color_mode: 'palette',
  icon_contrast: 1,
  icon_brightness: 0,
  brightness_percent: 75,
  font_size_percent: 100,
  icon_size_percent: 100,
}
