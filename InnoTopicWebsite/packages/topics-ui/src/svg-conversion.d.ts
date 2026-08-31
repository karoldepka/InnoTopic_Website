/**
 * Ambient types for the `svg-conversion` workspace package (a sibling Rust/Wasm project, see
 * ../../../svg-conversions), which ships its Web Worker wrapper as plain JS with no .d.ts of
 * its own - this mirrors web/svg-worker-pool.js's actual runtime API.
 */
declare module 'svg-conversion' {
  export interface SvgWorkerPoolOptions {
    size?: number
    workerUrl?: URL | string
  }

  export interface ProcessOptions {
    primaryColor?: string
    /** `primary_contrast` maps the icon's tones around primaryColor and ignores secondaryColor. */
    colorMode?: 'palette' | 'primary_contrast'
    /** Presence of secondaryColor switches the worker to the two-tone palette conversion. */
    secondaryColor?: string
    /** 0..2, 1 is neutral - only used with secondaryColor. */
    contrast?: number
    /** -1..1, 0 is neutral - only used with secondaryColor. */
    brightness?: number
    /** Single-color tolerance, only used without secondaryColor. */
    tolerance?: number
    /** 0..1 lightness range above and below primaryColor, used by primary_contrast mode. */
    primaryContrast?: number
    outputMode?: 'rgb' | 'css_vars'
  }

  export class SvgWorkerPool {
    constructor(options?: SvgWorkerPoolOptions)
    process(svg: string, options?: ProcessOptions): Promise<string>
    generateColorMap(primaryColor?: string): Promise<string>
    close(): void
  }
}
