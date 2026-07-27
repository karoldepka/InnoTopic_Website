import { ThemeConfigState } from '../../models/theme-config-state.model';

export interface ThemePreset {
  name: string;
  kind: 'light' | 'dark';
  config: ThemeConfigState;
}

/** Shared shadow settings for every preset below; the effect derives shadow colors from ion_background_color. */
const defaultShadow = {
  shadow_offset: '5',
  shadow_blur_radius: '10',
  shadow_opacity: 50,
}

function preset(
  name: string,
  kind: ThemePreset['kind'],
  colors: Pick<ThemeConfigState, 'ion_color_primary' | 'ion_color_secondary' | 'ion_background_color'>,
): ThemePreset {
  return { name, kind, config: { ...defaultShadow, ...colors } }
}

/**
 * Curated bright/dark theme presets, applied via the existing NgRx theme-config pipeline
 * (updateThemeConfig -> ThemeConfigEffects -> CSS custom properties on :root). See also
 * /theme-demo for freeform tuning of the same underlying state.
 */
export const themePresets: ThemePreset[] = [
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
]
