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
  // set in RGB format: https://ionicframework.com/docs/theming/advanced#the-alpha-problem
  root.setProperty(`${varName}-rgb`, hexToRgb(colorValue))
}
