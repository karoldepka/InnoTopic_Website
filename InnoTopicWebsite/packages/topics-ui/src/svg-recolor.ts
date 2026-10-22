type WorkerOptions = {
  primaryColor?: string
  colorMode?: 'palette' | 'primary_contrast'
  secondaryColor?: string
  contrast?: number
  brightness?: number
  primaryContrast?: number
  outputMode?: 'rgb' | 'css_vars'
}

type SvgWorkerPoolLike = {
  processMany(svgs: string[], options?: WorkerOptions): Promise<Array<{ result?: string; error?: string }>>
  processRaster(url: string, options?: WorkerOptions): Promise<string>
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

// One shared worker pool for every topic icon on the page. A conversion takes well under a
// millisecond (all ~2400 logos convert in about a second on one thread), while every worker
// downloads its own script, glue and Wasm - so a few workers are plenty, and more only delay
// the page's icons behind extra startup requests.
const MAX_POOL_SIZE = 4
function poolSize(): number {
  const count = globalThis.navigator?.hardwareConcurrency
  const cores = typeof count === 'number' && Number.isInteger(count) && count > 0 ? count : 1
  return Math.min(MAX_POOL_SIZE, cores)
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
          size: poolSize(),
          workerUrl: `${workerBasePath}svg-worker.js`,
        }) as SvgWorkerPoolLike
      } catch (error) {
        // Don't remember the failure: a transient one (a lazy chunk renamed by a dev-server
        // rebuild, a network blip) would otherwise leave every icon uncolored until a reload.
        console.warn('svg-recolor: worker pool unavailable, showing original icons', error)
        poolPromise = undefined
        return undefined
      }
    })()
  }
  return poolPromise
}

/**
 * Starts the worker pool (its script and Wasm) right away. Call it before the page requests its
 * icons: otherwise those downloads queue behind every icon file and conversions start late.
 */
export function warmUpSvgRecolor(): void {
  void getPool()
}

// Recoloring re-fetches the same static icon file on every drag tick; caching the raw SVG text
// (not the recolored result, which depends on the live colors) avoids a network request per tick.
const svgTextCache = new Map<string, Promise<string>>()

/**
 * The SVG file's text, downloaded once per page and shared with recolorSvg. Show the original
 * from it (see svgDataUrl) rather than also pointing an <img> at the URL, which downloads it again.
 */
export function loadSvgText(url: string): Promise<string> {
  return fetchSvgText(url)
}

/** An <img>-ready data URL for SVG markup; standalone SVG images only render with the namespace. */
export function svgDataUrl(markup: string): string {
  const withNamespace = markup.includes('xmlns="http://www.w3.org/2000/svg"') || markup.includes("xmlns='http://www.w3.org/2000/svg'")
    ? markup
    : markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(withNamespace)}`
}

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
  /** Time since this batch of conversions started; its total duration once done. */
  elapsedMs: number
  /** Nothing in this batch is pending any more. */
  done: boolean
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
    elapsedMs: Math.round(performance.now() - batch.startedAt),
    done: batch.pending === 0,
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
  batch.pending = Math.max(0, batch.pending - 1)
  if (failed) batch.failed += 1
  else batch.completed += 1
  batch.completedUrls.add(url)

  const previous = urlProgress.get(url) ?? defaultUrlProgress(url)
  const pending = Math.max(0, previous.pending - 1)
  urlProgress.set(url, {
    ...previous,
    state: pending > 0 ? 'processing' : failed && previous.completed === 0 ? 'failed' : 'complete',
    pending,
    completed: previous.completed + (failed ? 0 : 1),
    failed: previous.failed + (failed ? 1 : 0),
    elapsedMs: Math.round(performance.now() - startedAt),
  })
  publishUrlProgress(url)
  publishProgress(batch)

  if (batch.pending === 0 && activeBatch === batch) {
    activeBatch = undefined
    const failedNote = batch.failed ? `, ${batch.failed} failed` : ''
    console.log(`Colorized ${batch.completedUrls.size} unique icons (${batch.completed} conversions${failedNote}) `
      + `in ${((performance.now() - batch.startedAt) / 1000).toFixed(2)} s`)
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
  return shareRecolor(`svg:${recolorRequestKey(url, options)}`, () => recolorSvgOnce(url, options))
}

/**
 * Recolors a raster image (PNG/JPEG/WebP) with the same tone mapping as recolorSvg, decoding and
 * converting it in the worker pool. Resolves to a PNG data URL, or to `url` itself when the pool
 * is unavailable.
 */
export async function recolorRaster(url: string, options: RecolorOptions): Promise<string> {
  return shareRecolor(`raster:${recolorRequestKey(url, options)}`, () => recolorRasterOnce(url, options))
}

function shareRecolor(key: string, convert: () => Promise<string>): Promise<string> {
  const existing = recolorInFlight.get(key)
  if (existing) return existing

  const shared = convert().finally(() => {
    if (recolorInFlight.get(key) === shared) recolorInFlight.delete(key)
  })
  recolorInFlight.set(key, shared)
  return shared
}

/** sRGB channels of a #rgb / #rrggbb color; undefined for anything else. */
function hexRgb(color: string): [number, number, number] | undefined {
  const hex = color.trim().replace(/^#/, '')
  const full = hex.length === 3 ? [...hex].map(c => c + c).join('') : hex
  if (!/^[0-9a-f]{6}$/i.test(full)) return undefined
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

/** Below this RGB distance two colors read as the same (out of ~441 for black vs white). */
const MIN_PALETTE_COLOR_DISTANCE = 48

function tooCloseForPalette(a: string, b: string): boolean {
  const [x, y] = [hexRgb(a), hexRgb(b)]
  if (!x || !y) return a.trim().toLowerCase() === b.trim().toLowerCase()
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < MIN_PALETTE_COLOR_DISTANCE
}

function workerOptions(options: RecolorOptions): WorkerOptions {
  // The palette maps a logo's darkest tones to primary and its lightest to secondary. With secondary
  // (nearly) equal to primary every tone would get the same color and logos would turn into flat
  // silhouettes, so map the tones around primary instead (keeping the logos' detail).
  const paletteWithoutContrast = options.colorMode !== 'primary_contrast' && !!options.secondaryColor
    && tooCloseForPalette(options.primaryColor, options.secondaryColor)
  const usePrimaryContrast = options.colorMode === 'primary_contrast' || paletteWithoutContrast
  return {
    primaryColor: options.primaryColor,
    ...(usePrimaryContrast
      ? {
          colorMode: 'primary_contrast' as const,
          // The palette's contrast is on a different (0..2) scale, so the fallback uses the default range.
          primaryContrast: paletteWithoutContrast ? 0.3 : options.primaryContrast ?? 0.3,
        }
      : {
          secondaryColor: options.secondaryColor,
          contrast: options.contrast,
          brightness: options.brightness,
        }),
    outputMode: 'rgb',
  }
}

// A page shows hundreds of icons. Conversions requested within a short window go out as one
// message per worker rather than one per icon, so the page's main thread handles a few replies
// (and their framework change-detection passes) instead of hundreds.
const BATCH_WINDOW_MS = 30
type QueuedConversion = { svg: string; resolve: (svg: string) => void; reject: (error: Error) => void }
const conversionQueues = new Map<string, { options: WorkerOptions; items: QueuedConversion[] }>()
let batchFlushTimer: ReturnType<typeof setTimeout> | undefined

function convertInBatch(pool: SvgWorkerPoolLike, svg: string, options: WorkerOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const key = JSON.stringify(options)
    let queue = conversionQueues.get(key)
    if (!queue) {
      queue = { options, items: [] }
      conversionQueues.set(key, queue)
    }
    queue.items.push({ svg, resolve, reject })
    batchFlushTimer ??= setTimeout(() => flushConversions(pool), BATCH_WINDOW_MS)
  })
}

function flushConversions(pool: SvgWorkerPoolLike) {
  batchFlushTimer = undefined
  const queues = [...conversionQueues.values()]
  conversionQueues.clear()
  for (const { options, items } of queues) {
    // One chunk per worker, so the pool still converts in parallel.
    const chunkSize = Math.ceil(items.length / poolSize())
    for (let start = 0; start < items.length; start += chunkSize) {
      const chunk = items.slice(start, start + chunkSize)
      pool.processMany(chunk.map(item => item.svg), options).then(
        outcomes => outcomes.forEach(({ result, error }, index) => {
          if (result === undefined) chunk[index].reject(new Error(error ?? 'svg-recolor: no result'))
          else chunk[index].resolve(result)
        }),
        error => chunk.forEach(item => item.reject(error)),
      )
    }
  }
}

async function recolorSvgOnce(url: string, options: RecolorOptions): Promise<string> {
  const { batch, startedAt } = startRecolorTiming(url)
  let failed = true
  try {
    const pool = getPool()
    const svgText = await fetchSvgText(url)
    const workerPool = await pool
    if (!workerPool) {
      failed = false
      return svgText
    }

    const result = await convertInBatch(workerPool, svgText, workerOptions(options))
    failed = false
    return result
  } finally {
    finishRecolorTiming(batch, startedAt, url, failed)
  }
}

async function recolorRasterOnce(url: string, options: RecolorOptions): Promise<string> {
  const { batch, startedAt } = startRecolorTiming(url)
  let failed = true
  try {
    const workerPool = await getPool()
    if (!workerPool) {
      failed = false
      return url
    }

    // The worker fetches the image itself, where a relative URL would resolve against its script.
    const absoluteUrl = new URL(url, document.baseURI).href
    const result = await workerPool.processRaster(absoluteUrl, workerOptions(options))
    failed = false
    return result
  } finally {
    finishRecolorTiming(batch, startedAt, url, failed)
  }
}
