import {escapeHtml} from '../../utils/html-utils'
import {LinkPreviewResult} from './link-preview.service'

/** Marker class TinyMCE's own PastePreProcess/SetContent hooks look for, to detect a
 * paste-generated autolink anchor that's already been swapped for a card (or is in the middle of
 * being swapped), so it's never processed twice. */
export const LINK_PREVIEW_CARD_CLASS = 'apf-link-preview-card'

/** Renders a link-preview result as a plain HTML string (not a live Angular component) - this
 * has to survive being serialized into a rich-text HTML field and re-hydrated from scratch on
 * every future load, the same constraint every other piece of rich-text content already has.
 * `contenteditable="false"` makes TinyMCE treat the whole card as a single atomic, non-editable
 * unit (its standard technique for embedding a "widget" inside otherwise-editable content).
 * Built entirely from inline-level elements (span, not div) since this gets inserted at an inline
 * text-cursor position - typically inside a TinyMCE-managed `<p>` - and a block-level element
 * nested in a `<p>` is invalid HTML that browsers silently reparent on the next parse, which would
 * scramble this card's structure the first time the saved HTML is reloaded. */
export function renderLinkPreviewCardHtml(result: LinkPreviewResult): string {
  const url = escapeHtml(result.url)
  const href = escapeHtml(result.canonicalUrl || result.url)
  const title = escapeHtml(result.title || result.url)
  const description = result.description ? escapeHtml(result.description) : ''
  const siteName = result.siteName ? escapeHtml(result.siteName) : ''
  const image = result.imageUrl
    ? `<img src="${escapeHtml(result.imageUrl)}" alt="" style="width:96px;height:96px;object-fit:cover;border-radius:4px;flex-shrink:0;vertical-align:middle;" />`
    : ''

  return `<span class="${LINK_PREVIEW_CARD_CLASS}" data-link-preview-url="${url}" contenteditable="false" style="display:inline-flex;gap:12px;align-items:center;border:1px solid var(--ion-color-medium,#888);border-radius:8px;padding:8px;margin:4px 0;max-width:480px;vertical-align:top;">` +
    `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow" style="display:inline-flex;gap:12px;align-items:center;text-decoration:none;color:inherit;width:100%;">` +
    image +
    `<span style="min-width:0;display:inline-block;">` +
    `<span style="display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</span>` +
    (description ? `<span style="display:block;font-size:0.85em;opacity:0.8;overflow:hidden;text-overflow:ellipsis;">${description}</span>` : '') +
    (siteName ? `<span style="display:block;font-size:0.75em;opacity:0.6;">${siteName}</span>` : '') +
    `</span>` +
    `</a>` +
    `</span>`
}

/** Plain, non-XSS-able placeholder shown immediately after a bare-URL paste, while the real
 * preview is still being fetched - swapped for renderLinkPreviewCardHtml()'s output (or, on
 * failure/timeout, left alone) once the fetch resolves. `placeholderId` lets the caller find this
 * exact node again later (via `editor.getBody().querySelector('#' + placeholderId)`), since the
 * fetch resolves well after the synchronous paste-handling that created it has returned. */
export function renderLinkPreviewLoadingHtml(url: string, placeholderId: string): string {
  const escapedUrl = escapeHtml(url)
  return `<span id="${escapeHtml(placeholderId)}" class="${LINK_PREVIEW_CARD_CLASS}-loading" contenteditable="false" style="opacity:0.6;">${escapedUrl}</span>`
}
