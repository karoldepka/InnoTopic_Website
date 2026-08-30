// Ported from LifeSuite's theme-config/themes.data.ts, as part of unifying LifeSuite's
// ThemeService/ThemeCalculator into this shared engine - every primary/secondary/background
// triplet here is unchanged from the original, and every non-disabled entry is still enforced by
// the contrast/distinctness checks in theme-contrast.spec.ts (LifeSuite side, importing from this
// package). See theme-presets.ts for how this list is merged into the picker's full preset array.
import { getRgbColorFromHex, relativeLuminance } from './color-utils'
import type { ThemePreset } from './theme-presets'

const defaultShadow = {
  shadow_offset: '1',
  shadow_blur_radius: '3',
  shadow_opacity: 16,
  inner_shadow_offset: '-6',
  inner_shadow_blur_radius: '4',
  inner_shadow_opacity: 0,
}

const defaultCorners = {
  corner_radius_top_left: '12',
  corner_radius_top_right: '12',
  corner_radius_bottom_right: '12',
  corner_radius_bottom_left: '12',
}

const defaultIcon = {
  icon_contrast: 1,
  icon_brightness: 0,
}

// ThemeCalculator's own fallback when a LifeSuite Theme had no explicit background.
const DEFAULT_BACKGROUND = '#101010'

interface CuratedThemeInput {
  comment?: string
  background?: string
  experimental?: boolean
  disabled?: boolean
  excludeFromRandom?: boolean
  primary: string
  secondary: string
}

function curatedTheme(name: string, input: CuratedThemeInput): ThemePreset {
  const background = input.background || DEFAULT_BACKGROUND
  // Same luminance>0.5 threshold apply-theme.ts's getIonicTextColor('high') already uses for
  // black-vs-white text - reused here just to label each preset 'light'/'dark' for picker UIs.
  const kind: 'light' | 'dark' = relativeLuminance(getRgbColorFromHex(background)) > 0.5 ? 'light' : 'dark'
  return {
    name,
    kind,
    comment: input.comment,
    disabled: input.disabled,
    excludeFromRandom: input.excludeFromRandom,
    experimental: input.experimental,
    config: {
      ...defaultShadow,
      ...defaultCorners,
      ...defaultIcon,
      // Neutral placeholder - preset application preserves whatever the current global brightness
      // slider is set to rather than using this value (see ThemeUiService.setTheme()), matching
      // LifeSuite's original behavior of brightness being independent of which theme is picked.
      brightness_percent: 75,
      font_size_percent: 100,
      icon_size_percent: 100,
      ion_color_primary: input.primary,
      ion_color_secondary: input.secondary,
      ion_background_color: background,
    },
  }
}

export const curatedThemes: ThemePreset[] = [
  curatedTheme('Gray bg with black buttons', {
    background: '#202020',
    experimental: true,
    primary: '#a0a0a0',
    secondary: '#ac7100',
  }),
  curatedTheme('Porzeczki Agrest (Gooseberry & Currant)', {
    comment: 'Jellies',
    background: '#180808',
    primary: '#c72323',
    secondary: '#01b622',
  }),
  curatedTheme('Forest and black', {
    comment: 'Greens and browns',
    background: '#543c1c',
    primary: '#000000',
    secondary: '#78d500',
    experimental: true,
    excludeFromRandom: true,
  }),
  curatedTheme('Black and Dark Brown', {
    background: '#382613',
    primary: '#000000',
    secondary: '#8d0000',
    experimental: true,
    disabled: true,
  }),
  curatedTheme('Forest and river', {
    comment: 'Greens and browns and blue',
    background: '#2a1e0e',
    primary: '#878300',
    secondary: '#008dfd',
  }),
  curatedTheme('Forest, strawberries, lemons', {
    background: '#2a1e0e',
    primary: '#ff161e',
    secondary: '#008783',
  }),
  curatedTheme('Forest, strawberries, blueberries', {
    background: '#2a1e0e',
    primary: '#ff161e',
    secondary: '#0082da',
  }),
  curatedTheme('Dark Blue Bg, Agrest', {
    comment: 'Jellies',
    background: '#000080',
    primary: '#47973f',
    secondary: '#b68301',
  }),
  curatedTheme('Dark Green Bg, Agrest', {
    comment: 'Jellies',
    background: '#244d20',
    primary: '#0f1f0d',
    secondary: '#f3abff',
  }),
  curatedTheme('Dark purple and yellow', {
    comment: 'Jellies',
    experimental: true,
    primary: '#ffff00',
    secondary: '#52ff00',
  }),
  curatedTheme('Gray Green', {
    comment: 'Jellies',
    primary: '#6e6e6e',
    secondary: '#7e6d00',
  }),
  curatedTheme('Dark Gray and yellow', {
    primary: '#686868',
    secondary: '#b6b500',
  }),
  curatedTheme('Dark Gray and blue', {
    primary: '#686868',
    secondary: '#0066ff',
  }),
  curatedTheme('Dark Gray and purplish', {
    comment: 'Beetroot',
    primary: '#686868',
    secondary: '#c53700',
  }),
  curatedTheme('Salmon-Green', {
    primary: '#FA8072',
    secondary: '#007e02',
  }),
  curatedTheme('RosyBrown-Green', {
    primary: '#BC8F8F',
    secondary: '#007e02',
  }),
  curatedTheme('Fire', {
    primary: '#e8303a',
    secondary: '#e14dba',
  }),
  curatedTheme('Sunny Yellow', {
    comment: 'Bright background',
    background: '#f5e050',
    primary: '#1a1a1a',
    secondary: '#c1440e',
    experimental: true,
  }),
  curatedTheme('Cherry Blossom', {
    comment: 'Bright background',
    background: '#f7c6d9',
    primary: '#7a1f3d',
    secondary: '#207d74',
    experimental: true,
  }),
  curatedTheme('Arctic Ice', {
    comment: 'Bright background',
    background: '#dbeef5',
    primary: '#0b3d5c',
    secondary: '#c1440e',
    experimental: true,
  }),
  curatedTheme('Ocean Breeze', {
    background: '#062f3e',
    primary: '#12b5b0',
    secondary: '#ff6f59',
  }),
  curatedTheme('Lavender Dusk', {
    background: '#2c1b3d',
    primary: '#b892ff',
    secondary: '#ff6ec7',
  }),
  curatedTheme('Autumn Maple', {
    background: '#3b2412',
    primary: '#dd651b',
    secondary: '#23e82c',
  }),
  curatedTheme('Mint Chocolate', {
    background: '#241a14',
    primary: '#3ddc97',
    secondary: '#f0e6d2',
  }),
  curatedTheme('Midnight Rose', {
    background: '#1a0d14',
    primary: '#e0218a',
    secondary: '#37d4a5',
  }),
  curatedTheme('Volcanic', {
    background: '#1c1c1c',
    primary: '#ff3b1f',
    secondary: '#7a7a7a',
  }),
  curatedTheme('Citrus Grove', {
    background: '#2b3a1e',
    primary: '#9acd32',
    secondary: '#00ff33',
  }),
  curatedTheme('Peach Sorbet', {
    comment: 'Bright background',
    background: '#fbe0c4',
    primary: '#7a3b12',
    secondary: '#0b5e5e',
    experimental: true,
  }),
  curatedTheme('Lilac Fields', {
    comment: 'Bright background',
    background: '#e8ddf5',
    primary: '#4a1a6b',
    secondary: '#a3400a',
    experimental: true,
  }),
  curatedTheme('Seafoam Morning', {
    comment: 'Bright background',
    background: '#d7f0e6',
    primary: '#0d4d3a',
    secondary: '#8c1a4a',
    experimental: true,
  }),
  curatedTheme('Buttercream', {
    comment: 'Bright background',
    background: '#fdf1d6',
    primary: '#5a3d00',
    secondary: '#0b4f8c',
    experimental: true,
  }),
  curatedTheme('Rose Quartz', {
    comment: 'Bright background',
    background: '#f6dfe6',
    primary: '#7a123f',
    secondary: '#1d3b5c',
    experimental: true,
  }),
  curatedTheme('Sky Linen', {
    comment: 'Bright background',
    background: '#dde8f7',
    primary: '#12305c',
    secondary: '#8a3b00',
    experimental: true,
  }),
  curatedTheme('Honeydew', {
    comment: 'Bright background',
    background: '#e2f2d9',
    primary: '#274d0e',
    secondary: '#10777a',
    experimental: true,
  }),
  curatedTheme('Coral Sands', {
    comment: 'Bright background',
    background: '#fde3d9',
    primary: '#7a1f0a',
    secondary: '#0b4a5c',
    experimental: true,
  }),
  curatedTheme('Wisteria', {
    comment: 'Bright background',
    background: '#e6def7',
    primary: '#3a1a6b',
    secondary: '#7a4c00',
    experimental: true,
  }),
  curatedTheme('Powder Blue', {
    comment: 'Bright background',
    background: '#dcecf2',
    primary: '#0b3d5c',
    secondary: '#6b1a3a',
    experimental: true,
  }),
  curatedTheme('Apricot Cream', {
    comment: 'Bright background',
    background: '#fbe8d3',
    primary: '#6b2d00',
    secondary: '#0d4d4d',
    experimental: true,
  }),
  curatedTheme('Mint Julep', {
    comment: 'Bright background',
    background: '#dff2e9',
    primary: '#0d4d2f',
    secondary: '#5c270d',
    experimental: true,
  }),
  curatedTheme('Deep Sea', {
    background: '#0a1f2c',
    primary: '#2ec4b6',
    secondary: '#ff9f1c',
  }),
  curatedTheme('Plum Ember', {
    background: '#241016',
    primary: '#e0507a',
    secondary: '#23e87e',
  }),
  curatedTheme('Slate Storm', {
    background: '#1c2229',
    primary: '#5aa9e6',
    secondary: '#e6a817',
  }),
  curatedTheme('Charcoal Lime', {
    primary: '#7ed321',
    secondary: '#2164e0',
  }),
  curatedTheme('Rustic Copper', {
    background: '#2b1a10',
    primary: '#d2691e',
    secondary: '#3aa6a6',
  }),
  curatedTheme('Indigo Night', {
    background: '#161029',
    primary: '#8a7ff0',
    secondary: '#ffb703',
  }),
  curatedTheme('Blackberry Fizz', {
    background: '#1a0f22',
    primary: '#a239ca',
    secondary: '#d6843a',
  }),
  curatedTheme('Graphite Amber', {
    primary: '#e0a010',
    secondary: '#3a8dde',
  }),
]
