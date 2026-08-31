import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { topicsRegistry } from '../topics-registry'
import { highlightedId } from '../highlight-store'
import { Topic } from '../data/Topic'
import './chip'
import './topic-logo'

/**
 * Ports Angular's TopicTagComponent (app-topic-tag) - the one genuinely Angular-coupled
 * component in this set: document-level click/Escape listeners (host bindings there, manual
 * connectedCallback/disconnectedCallback here) and real Shadow DOM instead of the original's
 * ViewEncapsulation.None. Auditing the original .scss showed only one rule actually reaches
 * across a component boundary (`app-chip app-topic-logo { margin-right: 6px }`, targeting an
 * internally-rendered child, not a slotted one) - that ports to a plain scoped rule below with
 * no Shadow DOM workaround needed. Everything else in the original 217-line file was already
 * dead/commented-out legacy styles.
 */
@customElement('topic-tag')
export class TopicTag extends LitElement {
  static styles = css`
    :host {
      position: relative;
      display: inline-block;
    }
    topic-chip {
      display: inline-block;
      margin: 0.3rem;
    }
    topic-logo {
      margin-right: 6px;
    }
    .topic-tag-content {
      display: flex;
      align-items: center;
    }
    .topic-tag-content--clickable {
      cursor: pointer;
    }
    .topic-tag-content--inline {
      align-items: baseline;
    }
    .topic-info-popover {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 20;
      margin-top: 4px;
      padding: 10px 12px;
      width: max-content;
      max-width: 280px;
      font-size: 13px;
      font-weight: normal;
      line-height: 1.4;
      text-align: left;
      color: #f2f2f2;
      background: #2b2b2b;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      cursor: default;
      animation: topic-info-popover-in 0.15s ease-out;
    }
    @keyframes topic-info-popover-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `

  /** tId as actually looked up: strips a leading "#" (FIXME for c#) and un-mangles "#Some_Hashtag" back to spaces. */
  @property({ attribute: 'tid' }) tId = ''
  /**
   * Intentionally NOT checked in render(): every current caller relies on logos always
   * showing. Kept as a property for a future caller that wants to opt out explicitly,
   * matching the Angular original's deliberate no-op here.
   */
  @property({ type: Boolean, attribute: 'show-logo' }) showLogo = true
  /** Drops the fixed pill font-size/padding so the tag blends into surrounding running text. */
  @property({ type: Boolean }) inline = false

  /** Forwarded to the internal <topic-logo> - see its class doc comment for what these do. */
  @property({ attribute: 'recolor-primary' }) recolorPrimary?: string
  @property({ attribute: 'recolor-secondary' }) recolorSecondary?: string
  @property({ type: Number, attribute: 'recolor-contrast' }) recolorContrast = 1
  @property({ type: Number, attribute: 'recolor-brightness' }) recolorBrightness = 0

  @state() private tagEntry?: Topic
  @state() private showInfoPopover = false
  @state() private isHighlighted = false

  private unsubscribeHighlight?: () => void
  private unsubscribeExtended?: () => void
  private readonly onDocumentClickBound = this.onDocumentClick.bind(this)
  private readonly onDocumentKeydownBound = this.onDocumentKeydown.bind(this)

  connectedCallback() {
    super.connectedCallback()
    this.resolveTopic()
    document.addEventListener('click', this.onDocumentClickBound)
    document.addEventListener('keydown', this.onDocumentKeydownBound)
    this.unsubscribeHighlight = highlightedId.subscribe(id => {
      this.isHighlighted = this.tagEntry?.id === id
    })
    // Re-render once the lazily-loaded extended-info chunk lands, so info-dependent state
    // (aria-expanded/clickable/title) catches up without the caller doing anything.
    this.unsubscribeExtended = topicsRegistry.extendedDataLoaded.subscribe(() => this.requestUpdate())
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('click', this.onDocumentClickBound)
    document.removeEventListener('keydown', this.onDocumentKeydownBound)
    this.unsubscribeHighlight?.()
    this.unsubscribeExtended?.()
  }

  protected willUpdate(changed: Map<string, unknown>) {
    if (changed.has('tId')) {
      this.resolveTopic()
    }
  }

  /**
   * getTopicById() already errorAlert()s when the topic can't be resolved - but an empty tId
   * isn't a lookup failure, it's just "not set yet". Some hosts (e.g. Angular rendering this
   * inside a deferred/embedded view) connect the element to the DOM before its property
   * bindings apply, so connectedCallback() can run once with tId still at its default '';
   * updated() re-runs this once the real value lands a tick later. Skip the lookup (and its
   * error log) in that transient state instead of treating it as a real resolution failure.
   */
  private resolveTopic() {
    if (!this.tId) {
      return
    }
    const normalizedTId = this.tId.replace('#', '').replace(/_/g, ' ')
    this.tagEntry = topicsRegistry.getTopicById(normalizedTId)
    this.isHighlighted = this.tagEntry?.id === highlightedId.value
  }

  private get displayName(): string {
    return this.tagEntry?.name ?? this.tId
  }

  /** Short blurb for this topic, if any. Drives the click-to-reveal info popover. */
  private get info(): string | undefined {
    return topicsRegistry.getTopicInfo(this.tagEntry)
  }

  private onTagClick(event: Event) {
    this.dispatchEvent(new CustomEvent<Topic | undefined>('click-topic', {
      detail: this.tagEntry,
      bubbles: true,
      composed: true,
    }))
    if (!this.info) {
      return
    }
    event.stopPropagation()
    this.showInfoPopover = !this.showInfoPopover
  }

  private onTagKeydown(event: KeyboardEvent) {
    if (!this.info || (event.key !== 'Enter' && event.key !== ' ')) {
      return
    }
    event.preventDefault()
    this.onTagClick(event)
  }

  /** Closes the info popover when clicking anywhere outside this tag (including other shadow trees). */
  private onDocumentClick(event: MouseEvent) {
    if (this.showInfoPopover && !event.composedPath().includes(this)) {
      this.showInfoPopover = false
    }
  }

  private onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showInfoPopover = false
    }
  }

  protected render() {
    const info = this.info
    const clickable = !!info

    return html`
      <topic-chip .inline=${this.inline}>
        <div
          class=${classMap({
            'topic-tag-content': true,
            'topic-tag-content--clickable': clickable,
            'topic-tag-content--inline': this.inline,
          })}
          role=${ifDefined(clickable ? 'button' : undefined)}
          tabindex=${ifDefined(clickable ? 0 : undefined)}
          aria-expanded=${ifDefined(clickable ? String(this.showInfoPopover) : undefined)}
          title=${ifDefined(clickable ? `${this.displayName} (tap or click to show more info)` : undefined)}
          @click=${this.onTagClick}
          @keydown=${this.onTagKeydown}
        >
          ${this.tagEntry?.logo ? html`
            <topic-logo
              .topic=${this.tagEntry}
              .recolorPrimary=${this.recolorPrimary}
              .recolorSecondary=${this.recolorSecondary}
              .recolorContrast=${this.recolorContrast}
              .recolorBrightness=${this.recolorBrightness}
            ></topic-logo>
          ` : ''}
          ${this.displayName}
          <slot></slot>
        </div>
      </topic-chip>

      ${this.showInfoPopover ? html`
        <div class="topic-info-popover" role="tooltip" @click=${(e: Event) => e.stopPropagation()}>
          ${info}
        </div>
      ` : ''}
    `
  }
}
