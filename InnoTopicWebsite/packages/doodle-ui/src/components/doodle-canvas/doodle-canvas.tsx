import { Component, Prop, State, Watch, Event, EventEmitter, Method, h } from '@stencil/core'

interface Point {
  x: number
  y: number
}

interface DraftStroke {
  color: string
  width: number
  points: Point[]
}

interface StrokeItem extends DraftStroke {
  id: string
  kind: 'stroke'
}

interface TextItem {
  id: string
  kind: 'text'
  x: number
  y: number
  text: string
  color: string
  fontSize: number
}

type DoodleElement = StrokeItem | TextItem

interface EditingText {
  id: string
  x: number
  y: number
  initialText: string
  isNew: boolean
}

export interface StrokeSnapshot {
  /** Count of all committed elements - strokes and text combined, since undo/redo treat both
   * uniformly. */
  strokeCount: number
  canUndo: boolean
  canRedo: boolean
}

interface ExportOptions {
  includeBackground?: boolean
}

const DEFAULT_COLORS = ['#1c1c1e', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0a84ff', '#af52de', '#ffffff']
const DRAG_THRESHOLD_PX = 4
const SVG_NS = 'http://www.w3.org/2000/svg'

// Strokes (and text placement) live in a fixed 0-100 x 0-100 coordinate space (not the stage's
// actual pixel size) and the <svg>'s viewBox stretches that space to fill the stage
// (preserveAspectRatio="none"). That's what makes this a real vector layer rather than a
// resolution-locked bitmap: an element placed in a small stage still repositions correctly if the
// stage is later resized, with no ResizeObserver or devicePixelRatio bookkeeping needed - the
// browser's own SVG/percentage scaling does that for free.
const VIEWBOX_SIZE = 100

const isStroke = (el: DoodleElement): el is StrokeItem => el.kind === 'stroke'
const isText = (el: DoodleElement): el is TextItem => el.kind === 'text'
const clamp = (v: number) => Math.min(VIEWBOX_SIZE, Math.max(0, v))

/**
 * Freehand doodling + text overlay for an SVG or bitmap image. The background is a plain <img>
 * (CSS object-fit handles contain/cover); pen strokes are <path> elements in an <svg> layer;
 * placed text is a separate absolutely-positioned HTML layer (SVG <text> can't hold a constant
 * on-screen font size under the svg's own non-uniform viewBox stretch the way
 * vector-effect="non-scaling-stroke" does for line width, so text gets its own layer instead).
 * Both layers write into the same `elements` list, so undo/redo/clear are just array operations,
 * not pixel manipulation.
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
  @Prop() fontSize: number = 20
  @Prop() minFontSize: number = 12
  @Prop() maxFontSize: number = 48
  @Prop() colors: string[] = DEFAULT_COLORS
  @Prop() showToolbar: boolean = true
  @Prop() disabled: boolean = false

  /** Fires after any mutation (stroke or text committed, clear, undo, redo, text moved) so a
   * host can drive its own save/undo button state without polling getSnapshot(). */
  @Event() doodleChange!: EventEmitter<StrokeSnapshot>

  @State() private mode: 'draw' | 'text' = 'draw'
  @State() private currentColor!: string
  @State() private currentWidth!: number
  @State() private currentFontSize!: number
  @State() private elements: DoodleElement[] = []
  @State() private activeStroke: DraftStroke | null = null
  @State() private editingText: EditingText | null = null

  // Not @State: every place that mutates this also mutates `elements` (a @State field) in the
  // same tick, which is what actually triggers the re-render that picks up the new value.
  private redoStack: DoodleElement[] = []
  private nextId = 0

  private stageEl!: HTMLDivElement
  private svgEl!: SVGSVGElement
  private imgEl?: HTMLImageElement
  private editBoxEl: HTMLElement | null = null
  private activePointerId: number | null = null
  private dragState: { id: string; pointerId: number; moved: boolean; startClientX: number; startClientY: number } | null = null
  private placeState: { pointerId: number; moved: boolean; clientX: number; clientY: number } | null = null

  componentWillLoad() {
    this.currentColor = this.strokeColor
    this.currentWidth = this.strokeWidth
    this.currentFontSize = this.fontSize
  }

  @Watch('strokeColor')
  onStrokeColorChange(color: string) {
    this.currentColor = color
  }

  @Watch('strokeWidth')
  onStrokeWidthChange(width: number) {
    this.currentWidth = width
  }

  @Watch('fontSize')
  onFontSizeChange(size: number) {
    this.currentFontSize = size
  }

  private get canUndo() {
    return this.elements.length > 0
  }

  private get canRedo() {
    return this.redoStack.length > 0
  }

  private setMode(mode: 'draw' | 'text') {
    if (this.disabled) return
    this.mode = mode
  }

  private percentFromClient(clientX: number, clientY: number): Point {
    const rect = this.stageEl.getBoundingClientRect()
    return {
      x: clamp(((clientX - rect.left) / rect.width) * VIEWBOX_SIZE),
      y: clamp(((clientY - rect.top) / rect.height) * VIEWBOX_SIZE),
    }
  }

  // --- pen drawing -----------------------------------------------------------------------

  private onPointerDown = (ev: PointerEvent) => {
    if (this.disabled || this.mode !== 'draw') return
    if (ev.pointerType === 'mouse' && ev.button !== 0) return
    ev.preventDefault()
    this.activePointerId = ev.pointerId
    // Pointer capture keeps move/up events targeting this element even once the pointer leaves
    // its bounds mid-stroke (fast strokes routinely overshoot before the next move event).
    this.svgEl.setPointerCapture(ev.pointerId)
    this.redoStack = []
    this.activeStroke = { color: this.currentColor, width: this.currentWidth, points: [this.percentFromClient(ev.clientX, ev.clientY)] }
  }

  private onPointerMove = (ev: PointerEvent) => {
    if (!this.activeStroke || ev.pointerId !== this.activePointerId) return
    // New object/array (not push()) so the @State setter sees a changed reference and re-renders.
    this.activeStroke = { ...this.activeStroke, points: [...this.activeStroke.points, this.percentFromClient(ev.clientX, ev.clientY)] }
  }

  private endStroke = (ev: PointerEvent) => {
    if (!this.activeStroke || ev.pointerId !== this.activePointerId) return
    const stroke: StrokeItem = { id: String(this.nextId++), kind: 'stroke', ...this.activeStroke }
    this.elements = [...this.elements, stroke]
    this.activeStroke = null
    this.activePointerId = null
    this.emitChange()
  }

  // --- text placement / drag / edit -------------------------------------------------------

  private onTextItemPointerDown = (ev: PointerEvent, item: TextItem) => {
    if (this.disabled || this.mode !== 'text') return
    ev.stopPropagation()
    ev.preventDefault()
    ;(ev.currentTarget as Element).setPointerCapture(ev.pointerId)
    this.dragState = { id: item.id, pointerId: ev.pointerId, moved: false, startClientX: ev.clientX, startClientY: ev.clientY }
  }

  private onTextLayerPointerDown = (ev: PointerEvent) => {
    if (this.disabled || this.mode !== 'text') return
    ;(ev.currentTarget as Element).setPointerCapture(ev.pointerId)
    this.placeState = { pointerId: ev.pointerId, moved: false, clientX: ev.clientX, clientY: ev.clientY }
  }

  private onTextLayerPointerMove = (ev: PointerEvent) => {
    if (this.dragState && ev.pointerId === this.dragState.pointerId) {
      const dx = ev.clientX - this.dragState.startClientX
      const dy = ev.clientY - this.dragState.startClientY
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) this.dragState.moved = true
      const point = this.percentFromClient(ev.clientX, ev.clientY)
      const id = this.dragState.id
      this.elements = this.elements.map(el => (el.id === id ? { ...el, x: point.x, y: point.y } : el))
      return
    }
    if (this.placeState && ev.pointerId === this.placeState.pointerId) {
      const dx = ev.clientX - this.placeState.clientX
      const dy = ev.clientY - this.placeState.clientY
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) this.placeState.moved = true
    }
  }

  private onTextLayerPointerUp = (ev: PointerEvent) => {
    if (this.dragState && ev.pointerId === this.dragState.pointerId) {
      const { id, moved } = this.dragState
      this.dragState = null
      if (moved) {
        this.emitChange()
      } else {
        const item = this.elements.find(el => el.id === id)
        if (item && isText(item)) this.startEditing(item, false)
      }
      return
    }
    if (this.placeState && ev.pointerId === this.placeState.pointerId) {
      const { moved, clientX, clientY } = this.placeState
      this.placeState = null
      if (!moved) {
        const point = this.percentFromClient(clientX, clientY)
        this.startEditing({ id: String(this.nextId++), kind: 'text', x: point.x, y: point.y, text: '', color: this.currentColor, fontSize: this.currentFontSize }, true)
      }
    }
  }

  private startEditing(item: TextItem, isNew: boolean) {
    this.editBoxEl = null
    this.editingText = { id: item.id, x: item.x, y: item.y, initialText: item.text, isNew }
  }

  private focusEditBox = (el?: HTMLElement) => {
    if (!el || el === this.editBoxEl) return
    this.editBoxEl = el
    requestAnimationFrame(() => {
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    })
  }

  private commitEditingText(el: HTMLElement) {
    const editing = this.editingText
    if (!editing) return
    const text = (el.textContent || '').trim()
    this.editingText = null
    this.editBoxEl = null
    if (!text) {
      if (!editing.isNew) {
        this.elements = this.elements.filter(item => item.id !== editing.id)
        this.emitChange()
      }
      return
    }
    if (editing.isNew) {
      const item: TextItem = { id: editing.id, kind: 'text', x: editing.x, y: editing.y, text, color: this.currentColor, fontSize: this.currentFontSize }
      this.elements = [...this.elements, item]
      this.redoStack = []
    } else {
      this.elements = this.elements.map(item => (item.id === editing.id ? { ...item, text } : item))
    }
    this.emitChange()
  }

  private onEditKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      ;(ev.target as HTMLElement).blur()
    } else if (ev.key === 'Escape') {
      ev.preventDefault()
      this.editingText = null
      this.editBoxEl = null
    }
  }

  private onEditBlur = (ev: FocusEvent) => {
    if (!this.editingText) return
    this.commitEditingText(ev.target as HTMLElement)
  }

  // --- shared mutation / export ------------------------------------------------------------

  private emitChange() {
    this.doodleChange.emit({ strokeCount: this.elements.length, canUndo: this.canUndo, canRedo: this.canRedo })
  }

  @Method()
  async clear(): Promise<void> {
    this.elements = []
    this.redoStack = []
    this.editingText = null
    this.emitChange()
  }

  @Method()
  async undo(): Promise<void> {
    if (this.elements.length === 0) return
    const next = [...this.elements]
    const last = next.pop() as DoodleElement
    this.elements = next
    this.redoStack = [...this.redoStack, last]
    this.emitChange()
  }

  @Method()
  async redo(): Promise<void> {
    if (this.redoStack.length === 0) return
    const nextRedo = [...this.redoStack]
    const restored = nextRedo.pop() as DoodleElement
    this.redoStack = nextRedo
    this.elements = [...this.elements, restored]
    this.emitChange()
  }

  @Method()
  async getSnapshot(): Promise<StrokeSnapshot> {
    return { strokeCount: this.elements.length, canUndo: this.canUndo, canRedo: this.canRedo }
  }

  /** Serializes the doodle - background image, strokes, and text - into standalone SVG markup.
   * Strokes are nested in their own nested <svg> carrying the 0-100 viewBox stretch; text is
   * placed directly in the outer, unscaled pixel space so glyphs never get stretched. */
  @Method()
  async exportSvg(opts: ExportOptions = {}): Promise<string> {
    const rect = this.stageEl.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    const root = this.buildExportSvg(width, height, opts.includeBackground !== false)
    return new XMLSerializer().serializeToString(root)
  }

  /** Rasterizes the doodle at the stage's current on-screen size and returns it as a PNG data
   * URL. Draws the background straight from the live <img> (not through exportSvg()'s <image
   * href>) - that href is only reliably resolved when the SVG lives in a real document, not when
   * it's rasterized standalone via a data: URI, which is exactly what happens here. */
  @Method()
  async exportPng(opts: ExportOptions = {}): Promise<string> {
    const includeBackground = opts.includeBackground !== false
    const rect = this.stageEl.getBoundingClientRect()
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

    const vectorLayer = this.buildExportSvg(width, height, false)
    const markup = new XMLSerializer().serializeToString(vectorLayer)
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
    const vectorImage = await this.loadImage(dataUrl)
    ctx.drawImage(vectorImage, 0, 0, width, height)

    return canvas.toDataURL('image/png')
  }

  private buildExportSvg(width: number, height: number, includeBackground: boolean): SVGSVGElement {
    const root = document.createElementNS(SVG_NS, 'svg')
    root.setAttribute('xmlns', SVG_NS)
    root.setAttribute('width', String(width))
    root.setAttribute('height', String(height))
    root.setAttribute('viewBox', `0 0 ${width} ${height}`)

    if (includeBackground && this.imageSrc) {
      const box = this.computeImageBox(width, height)
      const imageEl = document.createElementNS(SVG_NS, 'image')
      imageEl.setAttribute('href', this.imageSrc)
      imageEl.setAttribute('x', String(box.x))
      imageEl.setAttribute('y', String(box.y))
      imageEl.setAttribute('width', String(box.w))
      imageEl.setAttribute('height', String(box.h))
      root.appendChild(imageEl)
    }

    const strokesLayer = document.createElementNS(SVG_NS, 'svg')
    strokesLayer.setAttribute('x', '0')
    strokesLayer.setAttribute('y', '0')
    strokesLayer.setAttribute('width', String(width))
    strokesLayer.setAttribute('height', String(height))
    strokesLayer.setAttribute('viewBox', `0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`)
    strokesLayer.setAttribute('preserveAspectRatio', 'none')
    for (const el of this.elements) {
      if (isStroke(el)) strokesLayer.appendChild(this.buildPathEl(el))
    }
    root.appendChild(strokesLayer)

    for (const el of this.elements) {
      if (!isText(el)) continue
      const textEl = document.createElementNS(SVG_NS, 'text')
      textEl.setAttribute('x', String((el.x / VIEWBOX_SIZE) * width))
      textEl.setAttribute('y', String((el.y / VIEWBOX_SIZE) * height))
      textEl.setAttribute('fill', el.color)
      textEl.setAttribute('font-size', String(el.fontSize))
      textEl.setAttribute('font-family', 'sans-serif')
      textEl.setAttribute('text-anchor', 'middle')
      textEl.setAttribute('dominant-baseline', 'middle')
      textEl.textContent = el.text
      root.appendChild(textEl)
    }

    return root
  }

  private buildPathEl(stroke: DraftStroke): SVGPathElement {
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', this.pathData(stroke))
    path.setAttribute('stroke', stroke.color)
    path.setAttribute('stroke-width', String(stroke.width))
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    path.setAttribute('vector-effect', 'non-scaling-stroke')
    return path
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

  private onFontSizeInput = (ev: Event) => {
    this.currentFontSize = Number((ev.target as HTMLInputElement).value)
  }

  private pathData(stroke: DraftStroke): string {
    const [first, ...rest] = stroke.points
    if (!first) return ''
    // A zero-length "line" with round linecaps renders as a filled dot - reused for a plain tap
    // (single point, no move) so every stroke can go through the same <path> rendering.
    if (rest.length === 0) return `M ${first.x} ${first.y} L ${first.x} ${first.y}`
    return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ')
  }

  private renderStroke(stroke: DraftStroke, key?: string) {
    return (
      <path
        key={key}
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

  private renderTextItem(item: TextItem) {
    return (
      <div
        key={item.id}
        class="doodle-text-item"
        style={{ left: `${item.x}%`, top: `${item.y}%`, color: item.color, fontSize: `${item.fontSize}px` }}
        onPointerDown={ev => this.onTextItemPointerDown(ev, item)}
      >
        {item.text}
      </div>
    )
  }

  render() {
    const textItems = this.elements.filter(isText).filter(item => item.id !== this.editingText?.id)

    return (
      <div class="doodle-root">
        <div class="doodle-stage" ref={el => (this.stageEl = el as HTMLDivElement)}>
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
            class={{ 'doodle-draw': true, 'doodle-draw--inactive': this.disabled || this.mode !== 'draw' }}
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            preserveAspectRatio="none"
            ref={el => (this.svgEl = el as SVGSVGElement)}
            onPointerDown={this.onPointerDown}
            onPointerMove={this.onPointerMove}
            onPointerUp={this.endStroke}
            onPointerCancel={this.endStroke}
            onPointerLeave={this.endStroke}
          >
            {this.elements.filter(isStroke).map(stroke => this.renderStroke(stroke, stroke.id))}
            {this.activeStroke && this.renderStroke(this.activeStroke)}
          </svg>
          <div
            class={{ 'doodle-text-layer': true, 'doodle-text-layer--active': !this.disabled && this.mode === 'text' }}
            onPointerDown={this.onTextLayerPointerDown}
            onPointerMove={this.onTextLayerPointerMove}
            onPointerUp={this.onTextLayerPointerUp}
            onPointerCancel={this.onTextLayerPointerUp}
          >
            {textItems.map(item => this.renderTextItem(item))}
            {this.editingText && (
              <div
                class="doodle-text-edit"
                style={{ left: `${this.editingText.x}%`, top: `${this.editingText.y}%`, color: this.currentColor, fontSize: `${this.currentFontSize}px` }}
                contenteditable="true"
                ref={this.focusEditBox}
                onPointerDown={ev => ev.stopPropagation()}
                onKeyDown={this.onEditKeyDown}
                onBlur={this.onEditBlur}
              >
                {this.editingText.initialText}
              </div>
            )}
          </div>
        </div>
        {this.showToolbar && (
          <div class="doodle-toolbar">
            <div class="doodle-modes" role="radiogroup" aria-label="Tool">
              <button type="button" class={{ 'doodle-mode-btn': true, 'doodle-mode-btn--active': this.mode === 'draw' }} onClick={() => this.setMode('draw')}>Draw</button>
              <button type="button" class={{ 'doodle-mode-btn': true, 'doodle-mode-btn--active': this.mode === 'text' }} onClick={() => this.setMode('text')}>Text</button>
            </div>
            <div class="doodle-colors" role="radiogroup" aria-label="Color">
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
            {this.mode === 'draw' && (
              <input
                class="doodle-range"
                type="range"
                min={this.minStrokeWidth}
                max={this.maxStrokeWidth}
                value={this.currentWidth}
                onInput={this.onWidthInput}
                aria-label="Brush size"
              />
            )}
            {this.mode === 'text' && (
              <input
                class="doodle-range"
                type="range"
                min={this.minFontSize}
                max={this.maxFontSize}
                value={this.currentFontSize}
                onInput={this.onFontSizeInput}
                aria-label="Font size"
              />
            )}
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
