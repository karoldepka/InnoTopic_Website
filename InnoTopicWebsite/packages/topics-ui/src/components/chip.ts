import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

/**
 * Ports Angular's ChipComponent (app-chip) - a "neumorphic pill" wrapper around slotted
 * content, driven by two boolean flags. `--chip-shadow-margin`/`--shadow-offset`/
 * `--shadow-blur-radius`/`--corner-radius` are theme tokens set by @innotopic/theme-ui's
 * engine on :root; defaulted here with var(--x, fallback) so this still looks reasonable
 * standalone without that package present.
 */
@customElement('topic-chip')
export class TopicChip extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    .neumorphic-chip {
      display: inline-block;
      margin: var(--chip-shadow-margin, 7px);
      --shadow-light: rgba(255, 255, 255, 0.7);
      --shadow-dark: rgba(0, 0, 0, 0.25);
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--corner-radius, 20px 7px);
      transition: all 0.3s ease-in-out;
    }
    .neumorphic-chip:hover,
    .neumorphic-chip.force-hover {
      box-shadow:
        var(--shadow-offset, 5px) var(--shadow-offset, 5px) var(--shadow-blur-radius, 10px) var(--shadow-light),
        calc(-1 * var(--shadow-offset, 5px)) calc(-1 * var(--shadow-offset, 5px)) var(--shadow-blur-radius, 10px) var(--shadow-dark);
    }
    .neumorphic-chip:active {
      box-shadow:
        inset var(--shadow-offset, 5px) var(--shadow-offset, 5px) var(--shadow-blur-radius, 10px) var(--shadow-light),
        inset calc(-1 * var(--shadow-offset, 5px)) calc(-1 * var(--shadow-offset, 5px)) var(--shadow-blur-radius, 10px) var(--shadow-dark);
    }
    .neumorphic-chip.chip-inline {
      padding: 0 0.25em;
      font-size: inherit;
      font-weight: inherit;
      vertical-align: baseline;
    }
  `

  @property({ type: Boolean, attribute: 'force-mouse-over' }) forceMouseOver = false
  @property({ type: Boolean }) inline = false

  protected render() {
    return html`
      <div
        class=${classMap({
          'neumorphic-chip': true,
          'force-hover': this.forceMouseOver,
          'chip-inline': this.inline,
        })}
      >
        <slot></slot>
      </div>
    `
  }
}
