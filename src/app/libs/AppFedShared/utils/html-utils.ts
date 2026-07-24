import {nullish} from './type-utils'
import {isNullish} from './utils'
import {IdString} from '../odm/OdmItemId'

/** Escapes text for safe embedding as HTML content or a quoted attribute value. Needed wherever
 * externally-sourced text (e.g. a link-preview title scraped from someone else's website) gets
 * spliced into an HTML string that's later saved/rendered as rich text - without this, a
 * malicious `<title>` or `og:title` could inject a stored XSS payload. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function stripHtml(html?: string | nullish): string | nullish {
  if ( isNullish(html) ) {
    return html
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';

  // TODO: to consider: href links for searching
}

export function htmlToId(html: string | nullish): IdString | nullish {
  if ( isNullish(html) ) {
    return html
  }
  return stripHtml(html) ?. toLowerCase() ?. replace(/ /, '_') as IdString
}

/** True for a text/element node that renders as nothing visible - no text (ignoring &nbsp;) and
 * no embedded media (img/table/hr) that would make an apparently-"empty" block meaningful. */
function isVisiblyEmptyEdgeNode(node: ChildNode | null): boolean {
  if ( ! node ) {
    return false
  }
  if ( node.nodeType === Node.TEXT_NODE ) {
    return ! (node.textContent ?? '').trim()
  }
  if ( node.nodeType === Node.ELEMENT_NODE ) {
    const el = node as HTMLElement
    const text = (el.textContent ?? '').replace(/ /g, ' ').trim()
    return ! text && ! el.querySelector('img, table, hr')
  }
  return false
}

/** Strips leading/trailing empty paragraphs (`<p></p>`, `<p>&nbsp;</p>`, `<p><br></p>`, ...) and
 * whitespace-only text nodes from an HTML string - HTML-aware, unlike a plain string .trim()
 * which can't see through markup to tell "blank line" apart from meaningful content. Needed
 * because a rich-text editor (TinyMCE) normalizes whatever HTML it's given into well-formed
 * block elements, so a genuinely empty leading `<p></p>` (e.g. one convertToHtmlIfNeeded() used
 * to add below) renders as a real blank line on top of the content, not just inert markup. */
export function trimHtmlWhitespace(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  while ( isVisiblyEmptyEdgeNode(doc.body.firstChild) ) {
    doc.body.removeChild(doc.body.firstChild!)
  }
  while ( isVisiblyEmptyEdgeNode(doc.body.lastChild) ) {
    doc.body.removeChild(doc.body.lastChild!)
  }
  return doc.body.innerHTML
}

export function convertToHtmlIfNeeded(htmlOrPlainString?: string | null) {
  if ( ! htmlOrPlainString ) {
    return htmlOrPlainString
  }
  if ( typeof htmlOrPlainString !== 'string' ) {
    return htmlOrPlainString
  }
  if ( ! htmlOrPlainString?.match(/^\s*<\w+>.*/) ) {
    // console.log('convertToHtmlIfNeeded is plaintext:', htmlOrPlainString)
    const trimmed = htmlOrPlainString.trim()
    // Wrap the actual content in the paragraph (rather than prepending an empty `<p></p>` just to
    // mark the string as "already html") - GH: question/category/answer fields (e.g. from /ai/qa)
    // were rendering with a genuinely blank line on top, because that empty leading paragraph is
    // real, valid HTML once it reaches the rich-text editor, not something a later string .trim()
    // can remove.
    htmlOrPlainString = trimmed ? `<p>${trimmed.replace(/\n/g, `<br>`)}</p>` : ''
  } else {
    // console.log('convertToHtmlIfNeeded is html:', htmlOrPlainString)
    htmlOrPlainString = trimHtmlWhitespace(htmlOrPlainString)
  }
  return htmlOrPlainString;
}


