import { ThemeConfigState } from './theme-config-state'

export interface ThemePreset {
  name: string
  kind: 'light' | 'dark'
  config: ThemeConfigState
}

/** Shared shadow/corner settings for every preset below, unless a preset overrides them. */
const defaultShadow = {
  shadow_offset: '5',
  shadow_blur_radius: '10',
  shadow_opacity: 50,
}

/** Matches topic-chip's original hardcoded `border-radius: 20px 7px` look. */
const defaultCorners = {
  corner_radius_top_left: '20',
  corner_radius_top_right: '7',
  corner_radius_bottom_right: '20',
  corner_radius_bottom_left: '7',
}

/** Neutral icon recolor settings (see theme-config-state.ts) - most presets leave these alone. */
const defaultIcon = {
  icon_contrast: 1,
  icon_brightness: 0,
}

type PresetColors = Pick<ThemeConfigState, 'ion_color_primary' | 'ion_color_secondary' | 'ion_background_color'>
type PresetOverrides = Partial<Pick<ThemeConfigState,
  | 'shadow_offset' | 'shadow_blur_radius' | 'shadow_opacity'
  | 'corner_radius_top_left' | 'corner_radius_top_right' | 'corner_radius_bottom_right' | 'corner_radius_bottom_left'
  | 'icon_contrast' | 'icon_brightness'
>>

function preset(
  name: string,
  kind: ThemePreset['kind'],
  colors: PresetColors,
  overrides: PresetOverrides = {},
): ThemePreset {
  return { name, kind, config: { ...defaultShadow, ...defaultCorners, ...defaultIcon, ...colors, ...overrides } }
}

export const themePresets: ThemePreset[] = [
  // Ported verbatim from the Angular app's theme-presets.data.ts.
  preset('Classic Light', 'light', {
    ion_color_primary: '#007bff',
    ion_color_secondary: '#6c757d',
    ion_background_color: '#ffffff',
  }),
  preset('Classic Dark', 'dark', {
    ion_color_primary: '#4dabf7',
    ion_color_secondary: '#adb5bd',
    ion_background_color: '#1a1a1a',
  }),
  preset('Sunny Yellow', 'light', {
    ion_color_primary: '#1d3557',
    ion_color_secondary: '#e63946',
    ion_background_color: '#ffe066',
  }),
  preset('Yellow Midnight', 'dark', {
    ion_color_primary: '#ffd60a',
    ion_color_secondary: '#f4a300',
    ion_background_color: '#1c1a10',
  }),
  preset('Ocean Light', 'light', {
    ion_color_primary: '#0077b6',
    ion_color_secondary: '#00b4d8',
    ion_background_color: '#eaf6fb',
  }),
  preset('Ocean Midnight', 'dark', {
    ion_color_primary: '#48cae4',
    ion_color_secondary: '#00b4d8',
    ion_background_color: '#0b1d26',
  }),
  // Soft UI: low-contrast gray-on-gray palette, large soft blur, low shadow opacity, uniformly
  // rounded corners - the defining "everything looks pressed out of the same slab" look.
  preset('Neumorphism', 'light', {
    ion_color_primary: '#5b6b8c',
    ion_color_secondary: '#8895ab',
    ion_background_color: '#e0e5ec',
  }, {
    shadow_offset: '8',
    shadow_blur_radius: '24',
    shadow_opacity: 35,
    corner_radius_top_left: '20',
    corner_radius_top_right: '20',
    corner_radius_bottom_right: '20',
    corner_radius_bottom_left: '20',
  }),
  // Neubrutalism: loud high-contrast colors, a hard zero-blur offset shadow (max opacity so the
  // light/dark shadow pair pushes to near-white/near-black), and square corners.
  preset('Neubrutalism', 'light', {
    ion_color_primary: '#000000',
    ion_color_secondary: '#ff3864',
    ion_background_color: '#fef445',
  }, {
    shadow_offset: '6',
    shadow_blur_radius: '0',
    shadow_opacity: 100,
    corner_radius_top_left: '0',
    corner_radius_top_right: '0',
    corner_radius_bottom_right: '0',
    corner_radius_bottom_left: '0',
  }),
]
