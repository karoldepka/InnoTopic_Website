// Ported verbatim from the Angular app's src/app/utils/colors/ionic-color-utils.ts.
import { hexToRgb } from './color-utils'

function hexToRgbParts(hex: string): [number, number, number] {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  const expanded = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  const num = parseInt(expanded, 16);
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
  ];
}

function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgbParts(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function setIonicColorSteps(baseColor: string, step: number = 50, limit: number = 950): void {
  const root = document.documentElement;

  for (let i = step; i <= limit; i += step) {
    const factor = i / 1000;
    const color = hexToRgba(baseColor, factor);
    const ccsVarName = `--ion-color-step-${i}`;
    root.style.setProperty(ccsVarName, color);
  }
}

export function setIonicColorVarHexAndRgb(root: CSSStyleDeclaration, varName: string, colorValue: string) {
  root.setProperty(varName, colorValue)
  // Ionic's own "-rgb" suffix convention (https://ionicframework.com/docs/theming/advanced#the-
  // alpha-problem) is a BARE "r, g, b" triplet, meant to be used as rgba(var(--x-rgb), alpha) -
  // hexToRgb() returns the wrapped "rgb(r, g, b)" CSS function string instead (a different,
  // equally valid use), which breaks that pattern (rgba() can't take a nested rgb(...) as its
  // first argument) - strip the "rgb(" / ")" wrapper hexToRgb() always produces.
  root.setProperty(`${varName}-rgb`, hexToRgb(colorValue).slice(4, -1))
}
