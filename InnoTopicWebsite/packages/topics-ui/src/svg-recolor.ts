type SvgWorkerPoolLike = {
  process(svg: string, options?: {
    primaryColor?: string
    secondaryColor?: string
    contrast?: number
    brightness?: number
    outputMode?: 'rgb' | 'css_vars'
  }): Promise<string>
}

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

// One shared worker pool for every topic icon on the page. It is deliberately sized to the
// browser-reported number of logical CPU cores so a theme update can recolor many SVGs in
// parallel; the fallback keeps recoloring available in environments that do not expose it.
function logicalCpuCount(): number {
  const count = globalThis.navigator?.hardwareConcurrency
  return typeof count === 'number' && Number.isInteger(count) && count > 0 ? count : 1
}

// Each icon component is cheap to call, but the pool owns real Worker threads, so it is created
// lazily and shared across the page rather than creating a pool per component.
let poolPromise: Promise<SvgWorkerPoolLike | undefined> | undefined
async function getPool(): Promise<SvgWorkerPoolLike | undefined> {
  if (!poolPromise) {
    poolPromise = (async () => {
      try {
        // Keep this import visible to the bundler. A Function-created import leaves the bare
        // `svg-conversion` specifier for the browser to resolve at runtime, so the live theme
        // preview silently falls back to the original SVG outside a dev-server import map.
        // The worker URL remains explicit because the worker itself is copied as a static asset.
        const svgConversion = await import('svg-conversion')
        return new svgConversion.SvgWorkerPool({
          size: logicalCpuCount(),
          workerUrl: `${workerBasePath}svg-worker.js`,
        }) as SvgWorkerPoolLike
      } catch {
        return undefined
      }
    })()
  }
  return poolPromise
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

type RecolorBatch = {
  startedAt: number
  pending: number
  completed: number
  failed: number
}

export interface SvgRecolorProgress {
  completed: number
  total: number
  failed: number
}

const progressSubscribers = new Set<(progress: SvgRecolorProgress | undefined) => void>()
export function onSvgRecolorProgress(callback: (progress: SvgRecolorProgress | undefined) => void): () => void {
  progressSubscribers.add(callback)
  return () => progressSubscribers.delete(callback)
}

function publishProgress(batch?: RecolorBatch) {
  const progress = batch && { completed: batch.completed, total: batch.completed + batch.pending, failed: batch.failed }
  progressSubscribers.forEach(callback => callback(progress))
}

let activeBatch: RecolorBatch | undefined

function startRecolorTiming(): { batch: RecolorBatch; startedAt: number } {
  if (!activeBatch) {
    activeBatch = {
      startedAt: performance.now(),
      pending: 0,
      completed: 0,
      failed: 0,
    }
  }
  activeBatch.pending += 1
  publishProgress(activeBatch)
  return { batch: activeBatch, startedAt: performance.now() }
}

function finishRecolorTiming(batch: RecolorBatch, startedAt: number, url: string, failed: boolean) {
  const elapsedMs = performance.now() - startedAt
  batch.pending -= 1
  batch.completed += 1
  if (failed) batch.failed += 1
  publishProgress(batch)
  console.debug('[topics-ui] SVG recolor', {
    url,
    elapsedMs: Number(elapsedMs.toFixed(2)),
    failed,
  })
  if (batch.pending === 0) {
    console.info('[topics-ui] SVG recolor batch complete', {
      icons: batch.completed,
      failed: batch.failed,
      elapsedMs: Number((performance.now() - batch.startedAt).toFixed(2)),
    })
    if (activeBatch === batch) activeBatch = undefined
    publishProgress()
  }
}

/** Fetches the icon at `url` and recolors it via the Rust/Wasm worker pool. */
export async function recolorSvg(url: string, options: RecolorOptions): Promise<string> {
  const { batch, startedAt } = startRecolorTiming()
  let failed = true
  try {
    const svgText = await fetchSvgText(url)
    const workerPool = await getPool()
    if (!workerPool) {
      failed = false
      return svgText
    }

    const result = await workerPool.process(svgText, {
      primaryColor: options.primaryColor,
      secondaryColor: options.secondaryColor,
      contrast: options.contrast,
      brightness: options.brightness,
      outputMode: 'rgb',
    })
    failed = false
    return result
  } finally {
    finishRecolorTiming(batch, startedAt, url, failed)
  }
}
