import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { topicsRegistry } from '../topics-registry'
import { Topic } from '../data/Topic'
import { recolorSvg } from '../svg-recolor'

export const defaultIconHeight = 18
const RECOLOR_DEBOUNCE_MS = 120

/**
 * Ports Angular's TopicLogoComponent (app-topic-logo). Its original .scss was empty.
 *
 * Optionally recolors the icon live via @innotopic/svg-conversion's Rust/Wasm worker pool: set
 * `recolorPrimary` (and optionally `recolorSecondary`/`recolorContrast`/`recolorBrightness`) and
 * this switches from the plain static `<img>` to a fetched + recolored inline `<svg>`. Left
 * unset (the default), behavior is unchanged - recoloring is strictly opt-in per instance.
 */
@customElement('topic-logo')
export class TopicLogo extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    img, .recolored-logo svg {
      vertical-align: middle;
    }
    .recolored-logo svg {
      display: block;
      height: 100%;
      width: auto;
    }
  `

  /** Accepts either a resolved Topic or a topic id/name string (resolved via topicsRegistry). */
  @property({ attribute: false }) topic!: Topic | string
  @property({ type: Number }) size = defaultIconHeight
  @property({ type: Number }) width?: number
  @property({ type: Number }) height?: number
  @property({ type: Number }) margin = 2

  /** Setting this switches rendering to a live-recolored inline SVG - see class doc comment. */
  @property({ attribute: 'recolor-primary' }) recolorPrimary?: string
  @property({ attribute: 'recolor-mode' }) recolorMode?: 'palette' | 'primary_contrast'
  @property({ attribute: 'recolor-secondary' }) recolorSecondary?: string
  @property({ type: Number, attribute: 'recolor-contrast' }) recolorContrast = 1
  @property({ type: Number, attribute: 'recolor-brightness' }) recolorBrightness = 0
  @property({ type: Number, attribute: 'recolor-primary-contrast' }) recolorPrimaryContrast = 0.3

  @state() private recoloredMarkup?: string
  private recolorRequestId = 0
  private recolorTimer?: ReturnType<typeof setTimeout>

  protected willUpdate(changed: Map<string, unknown>) {
    if (changed.has('recolorPrimary') || changed.has('recolorMode') || changed.has('recolorSecondary')
      || changed.has('recolorContrast') || changed.has('recolorBrightness')
      || changed.has('recolorPrimaryContrast') || changed.has('topic')) {
      this.updateRecolor()
    }
  }

  private updateRecolor() {
    const requestId = ++this.recolorRequestId
    clearTimeout(this.recolorTimer)
    const url = this.resolvedTopic?.logo
    if (!this.recolorPrimary || !url) {
      this.recoloredMarkup = undefined
      return
    }
    // Range inputs emit many values per drag. Coalesce them before any worker job is enqueued;
    // stale responses were already ignored below, but avoiding stale *work* keeps the shared
    // worker queue and its progress count bounded.
    this.recolorTimer = setTimeout(() => {
      recolorSvg(url, {
        primaryColor: this.recolorPrimary!,
        colorMode: this.recolorMode,
        secondaryColor: this.recolorSecondary,
        contrast: this.recolorContrast,
        brightness: this.recolorBrightness,
        primaryContrast: this.recolorPrimaryContrast,
      }).then(markup => {
        if (requestId === this.recolorRequestId) {
          this.recoloredMarkup = markup
        }
      }).catch(error => {
        console.error('topic-logo: recolor failed', error)
      })
    }, RECOLOR_DEBOUNCE_MS)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this.recolorTimer)
    this.recolorRequestId += 1
  }

  private get resolvedTopic(): Topic | undefined {
    const topic = this.topic
    return typeof topic === 'string' ? topicsRegistry.getTopicById(topic) : topic
  }

  /**
   * When the resolved topic has a logoSize, it always wins over explicit width/height
   * properties (matches the Angular original) so odd aspect ratios stay legible.
   */
  private get dimensions(): { width: number; height: number } {
    const size = this.size
    const logoSize = this.resolvedTopic?.logoSize
    if (!logoSize) {
      return { width: this.width ?? size, height: this.height ?? size }
    }
    const [logoWidth, logoHeight] = logoSize
    return logoHeight > logoWidth
      ? { width: size, height: (size * logoHeight) / logoWidth }
      : { width: (size * logoWidth) / logoHeight, height: size }
  }

  protected render() {
    const topic = this.resolvedTopic
    // Only height (+ margin-right/vertical-align) is applied, matching the Angular original -
    // width is computed above but was never actually assigned to a style there either.
    const { height } = this.dimensions

    if (this.recoloredMarkup) {
      return html`
        <span
          class="recolored-logo"
          style="display: inline-block; height: ${height}px; margin-right: ${this.margin}px;"
          title=${topic?.name ?? ''}
        >${unsafeSVG(this.recoloredMarkup)}</span>
      `
    }

    return html`
      <img
        src=${topic?.logo ?? ''}
        alt=""
        class="topic-logo-img"
        loading="lazy"
        decoding="async"
        style="height: ${height}px; margin-right: ${this.margin}px; vertical-align: middle;"
        title=${topic?.name ?? ''}
        @error=${(e: Event) => { (e.target as HTMLImageElement).style.display = 'none' }}
      >
    `
  }
}
