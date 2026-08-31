type SvgWorkerPoolLike = {
  process(svg: string, options?: {
    primaryColor?: string
    colorMode?: 'palette' | 'primary_contrast'
    secondaryColor?: string
    contrast?: number
    brightness?: number
    primaryContrast?: number
    outputMode?: 'rgb' | 'css_vars'
  }): Promise<string>
}

export interface RecolorOptions {
  primaryColor: string
  /** Maps source tones around primaryColor ± primaryContrast, without using secondaryColor. */
  colorMode?: 'palette' | 'primary_contrast'
  secondaryColor?: string
  /** 0..2, 1 is neutral - only applied when secondaryColor is set. */
  contrast?: number
  /** -1..1, 0 is neutral - only applied when secondaryColor is set. */
  brightness?: number
  /** 0..1 lightness range above and below primaryColor in primary_contrast mode. */
  primaryContrast?: number
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
  iconUrls: Set<string>
  completedUrls: Set<string>
}

export interface SvgRecolorProgress {
  /** Conversion jobs, retained for diagnostics. */
  completed: number
  total: number
  failed: number
  /** Distinct source SVGs, used by the on-screen progress indicator. */
  uniqueCompleted: number
  uniqueTotal: number
}

export interface SvgRecolorUrlProgress {
  url: string
  state: 'idle' | 'processing' | 'complete' | 'failed'
  /** In-flight conversions for this URL, possibly using different theme values. */
  pending: number
  completed: number
  failed: number
  elapsedMs?: number
}

export interface SvgRecolorUrlObservable {
  /** Subscribes to one SVG URL and immediately receives its current state. */
  subscribe(callback: (progress: SvgRecolorUrlProgress) => void): () => void
}

const progressSubscribers = new Set<(progress: SvgRecolorProgress | undefined) => void>()
export function onSvgRecolorProgress(callback: (progress: SvgRecolorProgress | undefined) => void): () => void {
  progressSubscribers.add(callback)
  return () => progressSubscribers.delete(callback)
}

function publishProgress(batch?: RecolorBatch) {
  const progress = batch && {
    completed: batch.completed,
    total: batch.completed + batch.pending,
    failed: batch.failed,
    uniqueCompleted: batch.completedUrls.size,
    uniqueTotal: batch.iconUrls.size,
  }
  progressSubscribers.forEach(callback => callback(progress))
}

const defaultUrlProgress = (url: string): SvgRecolorUrlProgress => ({
  url,
  state: 'idle',
  pending: 0,
  completed: 0,
  failed: 0,
})
const urlProgress = new Map<string, SvgRecolorUrlProgress>()
const urlProgressSubscribers = new Map<string, Set<(progress: SvgRecolorUrlProgress) => void>>()

function publishUrlProgress(url: string) {
  const progress = urlProgress.get(url) ?? defaultUrlProgress(url)
  urlProgressSubscribers.get(url)?.forEach(callback => callback(progress))
}

/**
 * Returns a stateful observable for one source SVG URL. It emits its current value immediately
 * on subscription, then `processing`, `complete`, or `failed` as its shared conversion changes.
 */
export function observeSvgRecolorUrl(url: string): SvgRecolorUrlObservable {
  return {
    subscribe(callback) {
      let subscribers = urlProgressSubscribers.get(url)
      if (!subscribers) {
        subscribers = new Set()
        urlProgressSubscribers.set(url, subscribers)
      }
      subscribers.add(callback)
      callback(urlProgress.get(url) ?? defaultUrlProgress(url))
      return () => {
        subscribers?.delete(callback)
        if (subscribers?.size === 0) urlProgressSubscribers.delete(url)
      }
    },
  }
}

let activeBatch: RecolorBatch | undefined

function startRecolorTiming(url: string): { batch: RecolorBatch; startedAt: number } {
  if (!activeBatch) {
    activeBatch = {
      startedAt: performance.now(),
      pending: 0,
      completed: 0,
      failed: 0,
      iconUrls: new Set(),
      completedUrls: new Set(),
    }
  }
  activeBatch.pending += 1
  activeBatch.iconUrls.add(url)
  const previous = urlProgress.get(url) ?? defaultUrlProgress(url)
  urlProgress.set(url, { ...previous, state: 'processing', pending: previous.pending + 1 })
  publishUrlProgress(url)
  publishProgress(activeBatch)
  return { batch: activeBatch, startedAt: performance.now() }
}

function finishRecolorTiming(batch: RecolorBatch, startedAt: number, url: string, failed: boolean) {
  const elapsedMs = performance.now() - startedAt
  batch.pending -= 1
  batch.completed += 1
  batch.completedUrls.add(url)
  if (failed) batch.failed += 1
  const previous = urlProgress.get(url) ?? defaultUrlProgress(url)
  const pending = Math.max(0, previous.pending - 1)
  urlProgress.set(url, {
    ...previous,
    state: pending > 0 ? 'processing' : failed ? 'failed' : 'complete',
    pending,
    completed: previous.completed + 1,
    failed: previous.failed + Number(failed),
    elapsedMs: Number(elapsedMs.toFixed(2)),
  })
  publishUrlProgress(url)
  publishProgress(batch)
  console.debug('[topics-ui] SVG recolor', {
    url,
    elapsedMs: Number(elapsedMs.toFixed(2)),
    failed,
  })
  if (batch.pending === 0) {
    console.info('[topics-ui] SVG recolor batch complete', {
      iconInstances: batch.completed,
      uniqueIcons: batch.iconUrls.size,
      failed: batch.failed,
      elapsedMs: Number((performance.now() - batch.startedAt).toFixed(2)),
    })
    if (activeBatch === batch) activeBatch = undefined
    publishProgress()
  }
}

// Topic logos recur throughout the graph, tags and previews. Coalesce equal requests while a
// recolor is running so every duplicate shares the same fetch and Wasm-worker conversion.
const recolorInFlight = new Map<string, Promise<string>>()
function recolorRequestKey(url: string, options: RecolorOptions): string {
  return JSON.stringify([
    url,
    options.primaryColor,
    options.colorMode ?? 'palette',
    options.secondaryColor ?? '',
    options.contrast ?? 1,
    options.brightness ?? 0,
    options.primaryContrast ?? 0.3,
  ])
}

/** Fetches the icon at `url` and recolors it via the Rust/Wasm worker pool. */
export async function recolorSvg(url: string, options: RecolorOptions): Promise<string> {
  const key = recolorRequestKey(url, options)
  const existing = recolorInFlight.get(key)
  if (existing) return existing

  const conversion = recolorSvgOnce(url, options)
  const shared = conversion.finally(() => {
    if (recolorInFlight.get(key) === shared) recolorInFlight.delete(key)
  })
  recolorInFlight.set(key, shared)
  return shared
}

async function recolorSvgOnce(url: string, options: RecolorOptions): Promise<string> {
  const { batch, startedAt } = startRecolorTiming(url)
  let failed = true
  try {
    const svgText = await fetchSvgText(url)
    const workerPool = await getPool()
    if (!workerPool) {
      failed = false
      return svgText
    }

    const usePrimaryContrast = options.colorMode === 'primary_contrast'
    const result = await workerPool.process(svgText, {
      primaryColor: options.primaryColor,
      ...(usePrimaryContrast
        ? {
            colorMode: 'primary_contrast' as const,
            primaryContrast: options.primaryContrast ?? 0.3,
          }
        : {
            secondaryColor: options.secondaryColor,
            contrast: options.contrast,
            brightness: options.brightness,
          }),
      outputMode: 'rgb',
    })
    failed = false
    return result
  } finally {
    finishRecolorTiming(batch, startedAt, url, failed)
  }
}
