import {toHsl, toRgb} from './adjust-luminance';

// Ported verbatim from the Angular app's src/app/utils/colors/colorUtils.ts (already zero
// framework dependency there).
export function hexToRgb(hex: string): string {
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

export function getIonicTextColor(backgroundColor: string, contrastValue: 'high' | 'medium' | 'low'): string {
  const hexToRgbTuple = (hex: string): number[] => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) {
      throw new Error(`Invalid hexadecimal color code: ${hex}`);
    }
    const [_, r, g, b] = match;
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  };
  const rgbBackground: number[] = hexToRgbTuple(backgroundColor);

  const luminance: number = (rgbBackground[0] * 0.299 + rgbBackground[1] * 0.587 + rgbBackground[2] * 0.114) / 255;

  if (contrastValue === 'high') {
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } else if (contrastValue === 'medium') {
    return luminance > 0.4 ? '#000000' : '#ffffff';
  } else if (contrastValue === 'low') {
    return luminance > 0.6 ? '#000000' : '#ffffff';
  } else {
    return '#000000';
  }
}

// Everything below is ported from LifeSuite's theme-config/color-utils.ts, as part of unifying
// LifeSuite's ThemeService/ThemeCalculator into this shared engine (see theme-config-state.ts's
// brightness_percent field and curated-themes.ts). Kept as separate functions rather than merged
// with getIonicTextColor() above (a different, already-in-use algorithm) to preserve the exact
// numeric behavior the existing curated theme palette was tuned against.

/**
 * @param color Hex value format: #ffffff or ffffff
 * @param decimal lighten or darken decimal value, example 0.5 to lighten by 50% or 1.5 to darken by 50%.
 */
export function shadeColor(color: string, decimal: number): string {
  const base = color.startsWith('#') ? 1 : 0;

  let r = parseInt(color.substring(base, 3), 16);
  let g = parseInt(color.substring(base + 2, 5), 16);
  let b = parseInt(color.substring(base + 4, 7), 16);

  r = Math.round(r / decimal);
  g = Math.round(g / decimal);
  b = Math.round(b / decimal);

  r = (r < 255) ? r : 255;
  g = (g < 255) ? g : 255;
  b = (b < 255) ? b : 255;

  const rr = ((r.toString(16).length === 1) ? `0${r.toString(16)}` : r.toString(16));
  const gg = ((g.toString(16).length === 1) ? `0${g.toString(16)}` : g.toString(16));
  const bb = ((b.toString(16).length === 1) ? `0${b.toString(16)}` : b.toString(16));

  return `#${rr}${gg}${bb}`;
}

export type RGB = [number, number, number];

export function getRgbColorFromHex(hex: string) {
  hex = hex.slice(1);
  const value = parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return [r, g, b] as RGB;
}

export function relativeLuminance(rgb: RGB) {
  // https://blog.cristiana.tech/calculating-color-contrast-in-typescript-using-web-content-accessibility-guidelines-wcag
  const [r, g, b] = rgb.map((v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

/** WCAG "UI component" contrast minimum (not the stricter 4.5:1 body-text one - these are
 * buttons/icons, not paragraphs). Shared by theme-contrast.spec.ts (enforced at theme-data commit
 * time) and the theme picker UI (displayed live) so both agree on what "passes". */
export const MIN_UI_CONTRAST = 3

/** Empirically-picked colorDistance() threshold below which two colors read as "the same color"
 * at a glance - see colorDistance()'s doc comment. Shared the same way as MIN_UI_CONTRAST above. */
export const MIN_COLOR_DISTANCE = 35

/** WCAG 2.x contrast ratio (1 = identical, 21 = black-on-white) between two colors, order-
 * independent. Used to validate a theme's primary/secondary actually stand out against its own
 * background - a color pair can each individually have "good" contrast against black/white text
 * (per relativeLuminance() above) while still being too close to *each other* to be legible
 * together. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(getRgbColorFromHex(hexA));
  const lumB = relativeLuminance(getRgbColorFromHex(hexB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToXyz([r, g, b]: RGB): RGB {
  const [rl, gl, bl] = [r, g, b].map(v => {
    v /= 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  }) as RGB;
  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) * 100;
  const y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) * 100;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) * 100;
  return [x, y, z];
}

function xyzToLab([x, y, z]: RGB): RGB {
  const [xr, yr, zr] = [x / 95.047, y / 100, z / 108.883].map(v =>
    v > 0.008856 ? Math.cbrt(v) : (7.787 * v) + 16 / 116
  ) as RGB;
  return [(116 * yr) - 16, 500 * (xr - yr), 200 * (yr - zr)];
}

/** Perceptual color difference (CIE76 deltaE) between two colors - unlike contrastRatio() above
 * (luminance-only, order-independent lightness), this also accounts for hue/saturation, so it
 * catches two similarly-bright but very different-looking colors as "close" only when a human eye
 * would actually see them that way. Needed because primary and secondary are used side-by-side to
 * distinguish UI state (e.g. a selected vs. unselected preset) - two colors that both contrast
 * fine against the background individually can still be near-indistinguishable from each other,
 * which contrastRatio() alone can't detect. Rule of thumb: <10 reads as "the same color" at a
 * glance, >20 is clearly two distinct colors even at a glance. */
export function colorDistance(hexA: string, hexB: string): number {
  const labA = xyzToLab(rgbToXyz(getRgbColorFromHex(hexA)));
  const labB = xyzToLab(rgbToXyz(getRgbColorFromHex(hexB)));
  return Math.sqrt(
    Math.pow(labA[0] - labB[0], 2) +
    Math.pow(labA[1] - labB[1], 2) +
    Math.pow(labA[2] - labB[2], 2)
  );
}

/** Below near-zero saturation a color reads as a neutral gray/muted tone, not "some hue" - its
 * computed hue angle is numerically arbitrary noise (toHsl() falls back to 0/red whenever
 * max===min) rather than anything a viewer actually perceives. hasSimilarHue() treats a color
 * this desaturated as automatically hue-distinct from everything, since a gray-vs-saturated pair
 * (e.g. curated-themes.ts's muted '#6c757d' secondaries) is already visually obvious without
 * comparing hue angles at all. */
const NEAR_GRAY_SATURATION = 0.15;

function hueDegrees(hex: string): number | null {
  const [h, s] = toHsl(toRgb(hex));
  return s < NEAR_GRAY_SATURATION ? null : h * 360;
}

/** Circular distance between two hues in degrees (0 = identical hue, 180 = opposite hue) -
 * ignores saturation/lightness entirely, unlike colorDistance()'s full perceptual deltaE. Null if
 * either color is a near-gray with no meaningful hue (see NEAR_GRAY_SATURATION). */
export function hueDistanceDegrees(hexA: string, hexB: string): number | null {
  const hueA = hueDegrees(hexA);
  const hueB = hueDegrees(hexB);
  if (hueA === null || hueB === null) {
    return null;
  }
  const diff = Math.abs(hueA - hueB) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export type ColorBlindnessType = 'protanopia' | 'deuteranopia' | 'tritanopia';

/** Simplified whole-population simulation matrices (the same approximation used by widely-used
 * colorblindness-simulation tools/browser extensions) for the three common dichromacy types -
 * protanopia/deuteranopia (the ~8% of men with red-green colorblindness) and the much rarer
 * tritanopia (blue-yellow). Applied directly in sRGB space rather than full LMS cone space: good
 * enough to answer "would these two theme colors still look different to this viewer", not
 * intended as a scientifically exact rendering. */
const COLOR_BLINDNESS_MATRICES: Record<ColorBlindnessType, [RGB, RGB, RGB]> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

export function simulateColorBlindness(hex: string, type: ColorBlindnessType): string {
  const [r, g, b] = getRgbColorFromHex(hex);
  const matrix = COLOR_BLINDNESS_MATRICES[type];
  const clampToHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  const [rr, gg, bb] = matrix.map(([mr, mg, mb]) => mr * r + mg * g + mb * b);
  return `#${clampToHex(rr)}${clampToHex(gg)}${clampToHex(bb)}`;
}

const COLOR_BLINDNESS_TYPES: ColorBlindnessType[] = ['protanopia', 'deuteranopia', 'tritanopia'];

/** Hue pairs closer than this read as "the same hue" at a glance - analogous colors (e.g.
 * orange/red) rather than genuinely distinct ones. Deliberately independent of MIN_COLOR_DISTANCE
 * above: two colors can fail this while easily passing colorDistance() (same hue, very different
 * lightness still reads as "the same color family" even though the deltaE is large), and two
 * colors can pass this while nominally failing colorDistance() (very different hue at matched
 * lightness/saturation - a real design choice, not a bug). */
export const MIN_HUE_DISTANCE_DEGREES = 30;

/** True if primary/secondary would read as the same hue to someone with ordinary color vision, or
 * as the same overall color to someone with any of the three common forms of color blindness.
 * Saturation and lightness are deliberately not factored into the *ordinary-vision* half of this
 * (colorDistance()/contrastRatio() above already cover those) - a pair can share both and still be
 * fine there, as long as the hue itself is distinguishable. A near-gray color (see
 * NEAR_GRAY_SATURATION) is never "similar hue" to anything under ordinary vision, since it's
 * already visually distinguishable by its grayness alone.
 *
 * The *simulated-vision* half can't reuse that same hue-only logic, though: colorblind simulation
 * works by desaturating certain hues toward each other, so two genuinely different source colors
 * (e.g. a red and a green) commonly both collapse toward the *same* dull, low-saturation
 * brownish-gray - which is precisely the classic red-green confusion, not a pair that happens to
 * both be exempt near-grays. colorDistance()'s full perceptual deltaE catches that correctly
 * (it scores two colors that both faded to a similar dull tone as close, regardless of whether
 * either individually reads as "gray"), so that's what's used per-simulation instead. */
export function hasSimilarHue(hexA: string, hexB: string, minDegrees = MIN_HUE_DISTANCE_DEGREES): boolean {
  const rawDistance = hueDistanceDegrees(hexA, hexB);
  if (rawDistance !== null && rawDistance < minDegrees) {
    return true;
  }
  return COLOR_BLINDNESS_TYPES.some(type =>
    colorDistance(simulateColorBlindness(hexA, type), simulateColorBlindness(hexB, type)) < MIN_COLOR_DISTANCE
  );
}
