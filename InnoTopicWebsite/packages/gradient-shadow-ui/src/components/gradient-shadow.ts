import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * Wraps slotted content - text, an icon, an arbitrary shape - in a soft shadow whose color
 * sweeps from `--ion-color-primary` to `--ion-color-secondary`, the same two tokens
 * @innotopic/theme-ui's engine drives on :root. Since theme-ui registers both as animatable
 * `@property` colors, the gradient doesn't just track theme changes live, it transitions
 * smoothly along with them rather than snapping.
 *
 * Built from stacked `filter: drop-shadow(...)` layers rather than a masked gradient clone:
 * drop-shadow works from the element's actual rendered alpha channel, so it silhouettes
 * correctly for text, icons, images-with-transparency, or plain shapes alike, with no
 * special-casing per content type.
 */
@customElement('gradient-shadow')
export class GradientShadow extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      transition: filter 0.3s ease-in-out;
    }
  `

  /** Direction the shadow sweeps toward, in degrees (0 = right, 90 = down). */
  @property({ type: Number }) angle = 135

  /**
   * How far the shadow extends from the content, in px - this needs to stay comfortably
   * larger than `blurRadius` or the layers overlap into a near-uniform blob instead of a
   * visible primary->secondary sweep (this was tuned up from an initial 12px default that did
   * exactly that, especially for lower-contrast color pairs).
   */
  @property({ type: Number }) distance = 40

  /** Blur radius of each individual shadow layer, in px - kept smaller than `distance` so the
   * two ends of the gradient stay visually distinct instead of averaging together. */
  @property({ type: Number, attribute: 'blur-radius' }) blurRadius = 6

  /** Number of stacked drop-shadow layers approximating the gradient - higher is smoother. */
  @property({ type: Number }) steps = 12

  /** Shadow strength, 0-1. */
  @property({ type: Number }) opacity = 0.6

  protected willUpdate() {
    this.style.filter = this.buildFilter()
  }

  private buildFilter(): string {
    const steps = Math.max(2, Math.round(this.steps))
    const rad = (this.angle * Math.PI) / 180
    const dx = Math.cos(rad)
    const dy = Math.sin(rad)
    const alphaPct = Math.round(Math.min(1, Math.max(0, this.opacity)) * 100)

    const layers: string[] = []
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const offset = (t - 0.5) * this.distance
      const x = (dx * offset).toFixed(2)
      const y = (dy * offset).toFixed(2)
      const mixPct = Math.round(t * 100)
      const gradientColor = `color-mix(in srgb, var(--ion-color-secondary, #6c757d) ${mixPct}%, var(--ion-color-primary, #007bff) ${100 - mixPct}%)`
      const color = alphaPct < 100
        ? `color-mix(in srgb, ${gradientColor} ${alphaPct}%, transparent)`
        : gradientColor
      layers.push(`drop-shadow(${x}px ${y}px ${this.blurRadius}px ${color})`)
    }
    return layers.join(' ')
  }

  render() {
    return html`<slot></slot>`
  }
}
