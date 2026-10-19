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
      vertical-align: middle;
    }
    .neumorphic-chip {
      display: inline-flex;
      align-items: center;
      margin: var(--chip-shadow-margin, 7px);
      --shadow-light: rgba(255, 255, 255, 0.7);
      --shadow-dark: rgba(0, 0, 0, 0.25);
      box-sizing: border-box;
      padding: 0.25rem 0.55rem;
      border: 1px solid var(--ion-color-step-300, rgba(127, 127, 127, 0.35));
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--corner-radius, 20px 7px);
      background: var(--ion-background-color, transparent);
      box-shadow:
        var(--shadow-offset, 2px) var(--shadow-offset, 2px) var(--shadow-blur-radius, 6px) var(--shadow-dark),
        calc(-1 * var(--shadow-offset, 2px)) calc(-1 * var(--shadow-offset, 2px)) var(--shadow-blur-radius, 6px) var(--shadow-light);
      transition: all 0.3s ease-in-out;
    }
    .neumorphic-chip slot {
      display: inline-flex;
      align-items: center;
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
      margin: 0;
      padding: 0;
      border-color: transparent;
      background: transparent;
      box-shadow: none;
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
