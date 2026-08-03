import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './topic-tag'

/**
 * Characters allowed inside a #hashtag body (after the leading char). Single source of truth,
 * ported verbatim from the Angular original.
 */
export const HASHTAG_BODY_CHAR_CLASS = 'A-Za-z0-9_.+-'

const HASHTAG_REGEX = new RegExp(`#([A-Za-z0-9_][${HASHTAG_BODY_CHAR_CLASS}]*[A-Za-z0-9_+]|[A-Za-z0-9_])`, 'g')

export interface HashtagTextPart {
  text: string
  isTag: boolean
  tagText?: string
}

/** Pure function, unit-testable without a DOM - ported verbatim from the Angular original. */
export function splitIntoHashtagParts(text: string): HashtagTextPart[] {
  const parts: HashtagTextPart[] = []
  HASHTAG_REGEX.lastIndex = 0
  let match: RegExpExecArray | null
  let lastIndex = 0

  while ((match = HASHTAG_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isTag: false })
    }
    parts.push({ text: match[0], isTag: true, tagText: match[0] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isTag: false })
  }

  return parts
}

/** Ports Angular's HashtagReplacerComponent (app-hashtag-replacer). */
@customElement('topic-hashtag-replacer')
export class HashtagReplacer extends LitElement {
  // display:contents - this component has no visuals of its own, just expands into inline
  // text + <topic-tag> chips; it shouldn't introduce a wrapper box into the surrounding flow.
  static styles = css`
    :host {
      display: contents;
    }
  `

  @property() text = ''

  protected render() {
    const parts = splitIntoHashtagParts(this.text ?? '')
    return html`${parts.map(part =>
      part.isTag
        ? html`<topic-tag tid=${part.tagText!.slice(1)} inline></topic-tag>`
        : part.text
    )}`
  }
}
