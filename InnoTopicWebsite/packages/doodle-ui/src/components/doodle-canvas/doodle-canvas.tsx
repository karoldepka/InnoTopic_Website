import { Component, Prop, State, Watch, Event, EventEmitter, Method, h } from '@stencil/core'

interface Point {
  x: number
  y: number
}

interface Stroke {
  color: string
  width: number
  points: Point[]
}

export interface StrokeSnapshot {
  strokeCount: number
  canUndo: boolean
  canRedo: boolean
}

const DEFAULT_COLORS = ['#1c1c1e', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#af52de', '#ffffff']

// Strokes live in a fixed 0-100 x 0-100 coordinate space (not the stage's actual pixel size) and
// the <svg>'s viewBox stretches that space to fill the stage (preserveAspectRatio="none"). That's
// what makes this a real vector layer rather than a resolution-locked bitmap: a stroke drawn in a
// small stage still repositions correctly if the stage is later resized, with no ResizeObserver
// or devicePixelRatio bookkeeping needed - the browser's own SVG scaling does that for free.
const VIEWBOX_SIZE = 100

/**
 * Freehand doodling overlay for an SVG or bitmap image. The background is a plain <img> (CSS
 * object-fit handles contain/cover), and doodle strokes are <path> elements in an <svg> layered
 * on top - each stroke is stored as its own list of points, so undo/redo/clear are just array
 * operations on `strokes`, not pixel manipulation.
 */
@Component({
  tag: 'doodle-canvas',
  styleUrl: 'doodle-canvas.css',
  shadow: true,
})
export class DoodleCanvas {
  /** URL of the base image to doodle over - works for both raster (png/jpg) and SVG sources,
   * since both render fine in a plain <img>. */
  @Prop() imageSrc?: string
  @Prop() imageAlt: string = ''
  /** Mirrors CSS object-fit for how imageSrc is scaled into the stage. */
  @Prop() fit: 'contain' | 'cover' = 'contain'
  /** Set to 'anonymous' when imageSrc is cross-origin and you need exportPng() to work - an
   * un-annotated cross-origin image taints the canvas and toDataURL() throws. */
  @Prop() crossOrigin?: 'anonymous' | 'use-credentials'
  @Prop() strokeColor: string = DEFAULT_COLORS[1]
  @Prop() strokeWidth: number = 6
  @Prop() minStrokeWidth: number = 2
  @Prop() maxStrokeWidth: number = 28
  @Prop() colors: string[] = DEFAULT_COLORS
  @Prop() showToolbar: boolean = true
  @Prop() disabled: boolean = false

  /** Fires after any mutation (stroke finished, clear, undo, redo) so a host can drive its own
   * save/undo button state without polling getSnapshot(). */
  @Event() doodleChange!: EventEmitter<StrokeSnapshot>

  @State() private currentColor!: string
  @State() private currentWidth!: number
  @State() private strokes: Stroke[] = []
  @State() private activeStroke: Stroke | null = null

  // Not @State: every place that mutates this also mutates `strokes` (a @State field) in the
  // same tick, which is what actually triggers the re-render that picks up the new value.
  private redoStack: Stroke[] = []

  private svgEl!: SVGSVGElement
  private imgEl?: HTMLImageElement
  private activePointerId: number | null = null

  componentWillLoad() {
    this.currentColor = this.strokeColor
    this.currentWidth = this.strokeWidth
  }

  @Watch('strokeColor')
  onStrokeColorChange(color: string) {
    this.currentColor = color
  }

  @Watch('strokeWidth')
  onStrokeWidthChange(width: number) {
    this.currentWidth = width
  }

  private get canUndo() {
    return this.strokes.length > 0
  }

  private get canRedo() {
    return this.redoStack.length > 0
  }

  private pointFromEvent(ev: PointerEvent): Point {
    const rect = this.svgEl.getBoundingClientRect()
    return {
      x: ((ev.clientX - rect.left) / rect.width) * VIEWBOX_SIZE,
      y: ((ev.clientY - rect.top) / rect.height) * VIEWBOX_SIZE,
    }
  }

  private onPointerDown = (ev: PointerEvent) => {
    if (this.disabled) return
    if (ev.pointerType === 'mouse' && ev.button !== 0) return
    ev.preventDefault()
    this.activePointerId = ev.pointerId
    // Pointer capture keeps move/up events targeting this element even once the pointer leaves
    // its bounds mid-stroke (fast strokes routinely overshoot before the next move event).
    this.svgEl.setPointerCapture(ev.pointerId)
    this.redoStack = []
    this.activeStroke = { color: this.currentColor, width: this.currentWidth, points: [this.pointFromEvent(ev)] }
  }

  private onPointerMove = (ev: PointerEvent) => {
    if (!this.activeStroke || ev.pointerId !== this.activePointerId) return
    // New object/array (not push()) so the @State setter sees a changed reference and re-renders.
    this.activeStroke = { ...this.activeStroke, points: [...this.activeStroke.points, this.pointFromEvent(ev)] }
  }

  private endStroke = (ev: PointerEvent) => {
    if (!this.activeStroke || ev.pointerId !== this.activePointerId) return
    this.strokes = [...this.strokes, this.activeStroke]
    this.activeStroke = null
    this.activePointerId = null
    this.emitChange()
  }

  private emitChange() {
    this.doodleChange.emit({ strokeCount: this.strokes.length, canUndo: this.canUndo, canRedo: this.canRedo })
  }

  @Method()
  async clear(): Promise<void> {
    this.strokes = []
    this.redoStack = []
    this.emitChange()
  }

  @Method()
  async undo(): Promise<void> {
    if (this.strokes.length === 0) return
    const next = [...this.strokes]
    const last = next.pop() as Stroke
    this.strokes = next
    this.redoStack = [...this.redoStack, last]
    this.emitChange()
  }

  @Method()
  async redo(): Promise<void> {
    if (this.redoStack.length === 0) return
    const nextRedo = [...this.redoStack]
    const restored = nextRedo.pop() as Stroke
    this.redoStack = nextRedo
    this.strokes = [...this.strokes, restored]
    this.emitChange()
  }

  @Method()
  async getSnapshot(): Promise<StrokeSnapshot> {
    return { strokeCount: this.strokes.length, canUndo: this.canUndo, canRedo: this.canRedo }
  }

  /** Serializes the doodle layer - plus the background image as an <image> if one is set - into
   * standalone, resolution-independent SVG markup. */
  @Method()
  async exportSvg(): Promise<string> {
    const rect = this.svgEl.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    const clone = this.svgEl.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(height))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    if (this.imageSrc) {
      const box = this.computeImageBox(width, height)
      const imageEl = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      imageEl.setAttribute('href', this.imageSrc)
      imageEl.setAttribute('x', String(box.x))
      imageEl.setAttribute('y', String(box.y))
      imageEl.setAttribute('width', String(box.w))
      imageEl.setAttribute('height', String(box.h))
      clone.insertBefore(imageEl, clone.firstChild)
    }
    return new XMLSerializer().serializeToString(clone)
  }

  /** Rasterizes the same markup exportSvg() would produce (background + strokes) at the stage's
   * current on-screen size, and returns it as a PNG data URL. */
  @Method()
  async exportPng(opts: { includeBackground?: boolean } = {}): Promise<string> {
    const includeBackground = opts.includeBackground !== false
    const rect = this.svgEl.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    if (includeBackground && this.imgEl?.complete && this.imgEl.naturalWidth > 0) {
      const box = this.computeImageBox(width, height)
      ctx.drawImage(this.imgEl, box.x, box.y, box.w, box.h)
    }

    const strokesSvg = this.serializeStrokesOnly(width, height)
    const strokesImage = await this.loadImage(strokesSvg)
    ctx.drawImage(strokesImage, 0, 0, width, height)

    return canvas.toDataURL('image/png')
  }

  private serializeStrokesOnly(width: number, height: number): string {
    const clone = this.svgEl.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(height))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const markup = new XMLSerializer().serializeToString(clone)
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  private computeImageBox(stageWidth: number, stageHeight: number) {
    const iw = this.imgEl?.naturalWidth || 1
    const ih = this.imgEl?.naturalHeight || 1
    const scale = this.fit === 'cover' ? Math.max(stageWidth / iw, stageHeight / ih) : Math.min(stageWidth / iw, stageHeight / ih)
    const w = iw * scale
    const h = ih * scale
    return { x: (stageWidth - w) / 2, y: (stageHeight - h) / 2, w, h }
  }

  private onWidthInput = (ev: Event) => {
    this.currentWidth = Number((ev.target as HTMLInputElement).value)
  }

  private pathData(stroke: Stroke): string {
    const [first, ...rest] = stroke.points
    if (!first) return ''
    // A zero-length "line" with round linecaps renders as a filled dot - reused for a plain tap
    // (single point, no move) so every stroke can go through the same <path> rendering.
    if (rest.length === 0) return `M ${first.x} ${first.y} L ${first.x} ${first.y}`
    return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ')
  }

  private renderStroke(stroke: Stroke) {
    return (
      <path
        d={this.pathData(stroke)}
        stroke={stroke.color}
        stroke-width={stroke.width}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    )
  }

  render() {
    return (
      <div class="doodle-root">
        <div class="doodle-stage">
          {this.imageSrc && (
            <img
              class="doodle-bg"
              src={this.imageSrc}
              alt={this.imageAlt}
              crossOrigin={this.crossOrigin}
              style={{ objectFit: this.fit }}
              ref={el => (this.imgEl = el as HTMLImageElement)}
            />
          )}
          <svg
            class={{ 'doodle-draw': true, 'doodle-draw--disabled': this.disabled }}
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            preserveAspectRatio="none"
            ref={el => (this.svgEl = el as SVGSVGElement)}
            onPointerDown={this.onPointerDown}
            onPointerMove={this.onPointerMove}
            onPointerUp={this.endStroke}
            onPointerCancel={this.endStroke}
            onPointerLeave={this.endStroke}
          >
            {this.strokes.map(stroke => this.renderStroke(stroke))}
            {this.activeStroke && this.renderStroke(this.activeStroke)}
          </svg>
        </div>
        {this.showToolbar && (
          <div class="doodle-toolbar">
            <div class="doodle-colors" role="radiogroup" aria-label="Brush color">
              {this.colors.map(color => (
                <button
                  type="button"
                  class={{
                    'doodle-swatch': true,
                    'doodle-swatch--active': color.toLowerCase() === this.currentColor.toLowerCase(),
                  }}
                  style={{ background: color }}
                  role="radio"
                  aria-checked={color.toLowerCase() === this.currentColor.toLowerCase() ? 'true' : 'false'}
                  aria-label={color}
                  onClick={() => (this.currentColor = color)}
                ></button>
              ))}
            </div>
            <input
              class="doodle-width"
              type="range"
              min={this.minStrokeWidth}
              max={this.maxStrokeWidth}
              value={this.currentWidth}
              onInput={this.onWidthInput}
              aria-label="Brush size"
            />
            <div class="doodle-actions">
              <button type="button" disabled={!this.canUndo} onClick={() => this.undo()}>Undo</button>
              <button type="button" disabled={!this.canRedo} onClick={() => this.redo()}>Redo</button>
              <button type="button" disabled={!this.canUndo} onClick={() => this.clear()}>Clear</button>
            </div>
          </div>
        )}
      </div>
    )
  }
}
