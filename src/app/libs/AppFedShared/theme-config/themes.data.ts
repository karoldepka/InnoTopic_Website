import {getDictionaryValuesAsArray, mapEntriesToArray, setIdsFromKeys} from '../utils/dictionary-utils'

export type ThemeId = string

// type HexColor = `#${string & { length: 6 }}`
type HexColor = string

// type HexDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
// type HexColor = `#${HexDigit}${HexDigit}${HexDigit}${HexDigit}${HexDigit}${HexDigit}`;
// type HexColor = string & { length: 7 } & { [0]: '#' } & { [K in 1 | 2 | 3 | 4 | 5 | 6]: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' };

export type Theme = {
  id?: string
  comment?: string;
  background?: HexColor;
  experimental?: boolean;
  disabled?: boolean;
  excludeFromRandom?: boolean;
  primary: HexColor;
  secondary: HexColor;
}

function theme(theme: Theme): Theme {
  return theme
}

export const themesMapById: { [key: string]: Theme } = setIdsFromKeys({
  // 'Bright': {
  //   // background: '#2c2c2c',
  //   background: '#cbcbcb',
  //   // background: '#6a2c2c',
  //   experimental: true,
  //   // primary: '#000000',
  //   primary: '#101010',
  //   secondary: '#674400',
  // }, wrong text color
  'Gray bg with black buttons': theme({
    // background: '#2c2c2c',
    background: '#202020',
    // background: '#6a2c2c',
    experimental: true,
    // GH: was #101010/#674400 - both too close in luminance to the background to read as
    // buttons/icons against it (contrast ratio ~1.4-1.5, WCAG UI-component minimum is 3:1).
    primary: '#a0a0a0',
    secondary: '#ac7100',
  }),
  'Porzeczki Agrest (Gooseberry & Currant)': theme({
    comment: 'Jellies',
    // GH: was '#6a2c2czz' - a typo (trailing "zz", not valid hex) that made shadeColor()'s
    // parsing produce a much lighter effective background than intended, in turn making primary
    // fail the 3:1 contrast check against it.
    background: '#180808',
    primary: '#c72323',
    secondary: '#b68001',
  }),
  // 'Forest': theme({
  //   comment: 'Greens and browns',
  //   background: '#2a1e0e',
  //   primary: '#6c6900',
  //   secondary: '#00a001',
  // primary and secondary too similar
  // }),
  'Forest and black': theme({
    comment: 'Greens and browns',
    background: '#543c1c',
    primary: '#000000', /* The black icons look kinda like a bug? Prolly too extreme contrast between primary and secondary color (some icons darker and some lighter than bg) */
    secondary: '#00d501', // GH: was #00a001 - contrast ratio ~1.8 against this background, below the 3:1 UI minimum
    experimental: true,
    excludeFromRandom: true,
  }),
  'Black and Dark Brown': theme({
    comment: '',
    background: '#382613',
    primary: '#000000',
    secondary: '#8d0000',
    experimental: true,
    disabled: true,
  }),
  // 'Dark Gray and Dark Brown & Red': theme({
  //   comment: '',
  //   background: '#1a1a1a',
  //   primary: '#ff0000',
  //   secondary: '#8d0000',
  //   experimental: true,
  // primary secondary too similar
  // }),
  'Forest and river': theme({
    comment: 'Greens and browns and blue',
    background: '#2a1e0e',
    primary: '#878300', // GH: was #6c6900 - contrast ratio ~2.3 against this background, below the 3:1 UI minimum
    secondary: '#008dfd',
  }),
  'Forest, strawberries, lemons': theme({
    // comment: 'Greens and browns and blue',
    background: '#2a1e0e',
    primary: '#ff161e',
    secondary: '#878300', // GH: was #6c6900 - contrast ratio ~2.3 against this background, below the 3:1 UI minimum
  }),
  'Forest, strawberries, blueberries': theme({
    // comment: 'Greens and browns and blue',
    background: '#2a1e0e',
    primary: '#ff161e',
    secondary: '#0082da', // GH: was #0075c4 - contrast ratio ~2.7 against this background, below the 3:1 UI minimum
  }),
  // 'Yellow Blue': theme({
  //   comment: 'Blue Yellow',
  //   background: '#000000',
  //   primary: '#ffb307',
  //   secondary: '#413cff',
  // }),
  'Dark Blue Bg, Agrest': theme({
    comment: 'Jellies',
    background: '#000080',
    primary: '#47973f', // GH: was #326a2c - contrast ratio ~1.8 against this background, below the 3:1 UI minimum
    secondary: '#b68001',
  }),
  'Dark Green Bg, Agrest': theme({
    comment: 'Jellies',
    background: '#244d20',
    primary: '#0f1f0d', // GH: was #326a2c - contrast ratio ~1.1 against this background, below the 3:1 UI minimum
    secondary: '#f3abff', // GH: was #b680ff - contrast ratio ~2.0 against this background, below the 3:1 UI minimum
  }),
  'Dark purple and yellow': theme({
    comment: 'Jellies',
    experimental: true,
    // background: 'darkblue',
    // GH: CSS named colors ('yellow'/'orange') broke shadeColor()/getRgbColorFromHex() elsewhere
    // in ThemeCalculator (they only parse #rrggbb hex strings) - hex equivalents instead.
    primary: '#ffff00',
    secondary: '#ffa500',
  }),
  'Gray Green': theme({
    comment: 'Jellies',
    primary: '#6e6e6e',
    secondary: '#007e00',
  }),
  // 'Blue Orange': theme({
  //   comment: 'Blueberries and orange',
  //   primary: '#004cb7',
  //   secondary: '#007e00',
  // }),
  // 'Grays': {
  //   comment: 'Darker and ligter grays',
  //   primary: '#939393',
  //   secondary: '#484848',
  // }, // too sad

  'Dark Gray and yellow': theme({
    comment: '',
    primary: '#686868', // GH: was #2f2f2f - contrast ratio ~1.2 against the default background, below the 3:1 UI minimum
    secondary: '#65b600',
  }),
  'Dark Gray and blue': theme({
    comment: '',
    primary: '#686868', // GH: was #2f2f2f - contrast ratio ~1.2 against the default background, below the 3:1 UI minimum
    // GH: was #007197 - too close to the gray primary (deltaE ~31) to read as a distinct
    // "selected" color next to it; a more saturated, vivid blue stands apart from a flat gray.
    secondary: '#0066ff',
  }),
  'Dark Gray and purplish': theme({
    comment: 'Beetroot',
    primary: '#686868', // GH: was #2f2f2f - contrast ratio ~1.3 against the default background, below the 3:1 UI minimum
    secondary: '#c50077', // GH: was #940059 - contrast ratio ~2.0 against the default background, below the 3:1 UI minimum
  }),
  // https://www.w3schools.com/colors/color_tryit.asp?hex=BC8F8F
  // 'Purple-Blue': theme({
  //   primary: '#663399',
  //   secondary: '#004cb7',
  // primary secondary too similar
  // }),
  'Salmon-Green': theme({
    primary: '#FA8072',
    secondary: '#007e00',
  }),
  'RosyBrown-Green': theme({
    primary: '#BC8F8F' /* is this somehow wrong? Coz so bright. */,
    secondary: '#007e00',
  }),
  // 'SaddleBrown-Green': theme({
  //   primary: '#8B4513',
  //   secondary: '#007e00',
  //  primary secondary too similar
  // }),
  'Fire': theme({
    primary: '#e8303a',
    secondary: '#e1b74d',
  }),
  // TODO: brown and green like forest

  // GH: 10 more themes, including at least one genuinely bright background (not just a dark bg
  // with a bright primary/secondary accent like the ones above) - relies on ThemeCalculator now
  // computing --ion-text-color from the background's own luminance, not always assuming white
  // text works.
  'Sunny Yellow': theme({
    comment: 'Bright background',
    background: '#f5e050',
    primary: '#1a1a1a',
    secondary: '#c1440e',
    experimental: true,
  }),
  'Cherry Blossom': theme({
    comment: 'Bright background',
    background: '#f7c6d9',
    primary: '#7a1f3d',
    secondary: '#3f7d20',
    experimental: true,
  }),
  'Arctic Ice': theme({
    comment: 'Bright background',
    background: '#dbeef5',
    primary: '#0b3d5c',
    // GH: was #00838f - a teal too close to the navy primary (deltaE ~15) to read as a distinct
    // "selected" color next to it; a warm coral accent contrasts clearly with the icy blue primary.
    secondary: '#c1440e',
    experimental: true,
  }),
  'Ocean Breeze': theme({
    background: '#062f3e',
    primary: '#12b5b0',
    secondary: '#ff6f59',
  }),
  'Lavender Dusk': theme({
    background: '#2c1b3d',
    primary: '#b892ff',
    secondary: '#ff6ec7',
  }),
  'Autumn Maple': theme({
    background: '#3b2412',
    primary: '#dd651b', // was #d2601a - contrast ratio ~2.76 against this background, below the 3:1 UI minimum
    // was #8b0000: dark red converges toward black same as this background does, so no amount of
    // further shading (either direction) clears 3:1 - gold reads as autumnal too and contrasts well.
    secondary: '#e8b923',
  }),
  'Mint Chocolate': theme({
    background: '#241a14',
    primary: '#3ddc97',
    secondary: '#f0e6d2',
  }),
  'Midnight Rose': theme({
    background: '#1a0d14',
    primary: '#e0218a',
    secondary: '#d4af37',
  }),
  'Volcanic': theme({
    background: '#1c1c1c',
    primary: '#ff3b1f',
    secondary: '#7a7a7a',
  }),
  'Citrus Grove': theme({
    background: '#2b3a1e',
    primary: '#9acd32',
    secondary: '#ff8c00',
  }),
})

export const themesArray = getDictionaryValuesAsArray(themesMapById)
