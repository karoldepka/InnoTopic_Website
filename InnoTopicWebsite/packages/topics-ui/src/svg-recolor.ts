import { SvgWorkerPool } from 'svg-conversion'

export interface RecolorOptions {
  primaryColor: string
  secondaryColor?: string
  /** 0..2, 1 is neutral - only applied when secondaryColor is set. */
  contrast?: number
  /** -1..1, 0 is neutral - only applied when secondaryColor is set. */
  brightness?: number
}

// svg-worker-pool.js's own default (`new URL('./svg-worker.js', import.meta.url)`) breaks once
// a bundler relocates/inlines the module - the exact same class of bug hit earlier with topic
// icon paths. Root-relative default here, configurable for consumers serving it elsewhere,
// paired with an angular.json asset glob copying svg-conversion's web/+pkg/ folders verbatim to
// this path so they're served as untouched static files (immune to bundler relocation) - the
// worker's own relative `../pkg/...` import then resolves correctly from there.
let workerBasePath = '/assets/svg-conversion/web/'
export function setWorkerBasePath(path: string) {
  workerBasePath = path
}

// One shared worker pool for every <topic-logo> on the page - each instance is cheap to call
// but the pool itself owns real Worker threads, so it's created lazily and only once.
let pool: SvgWorkerPool | undefined
function getPool(): SvgWorkerPool {
  return pool ??= new SvgWorkerPool({ workerUrl: `${workerBasePath}svg-worker.js` })
}

// Recoloring re-fetches the same static icon file on every drag tick; caching the raw SVG text
// (not the recolored result, which depends on the live colors) avoids a network request per tick.
const svgTextCache = new Map<string, Promise<string>>()
function fetchSvgText(url: string): Promise<string> {
  let cached = svgTextCache.get(url)
  if (!cached) {
    cached = fetch(url).then(response => {
      if (!response.ok) {
        throw new Error(`svg-recolor: failed to fetch ${url} (${response.status})`)
      }
      return response.text()
    })
    svgTextCache.set(url, cached)
  }
  return cached
}

/** Fetches the icon at `url` and recolors it via the Rust/Wasm worker pool. */
export async function recolorSvg(url: string, options: RecolorOptions): Promise<string> {
  const svgText = await fetchSvgText(url)
  return getPool().process(svgText, {
    primaryColor: options.primaryColor,
    secondaryColor: options.secondaryColor,
    contrast: options.contrast,
    brightness: options.brightness,
    outputMode: 'rgb',
  })
}
