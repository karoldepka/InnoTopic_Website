import {Component, Inject, Injector, Input, OnInit, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ViewSyncer} from '../../odm/ui/ViewSyncer'
import {EditorComponent} from '@tinymce/tinymce-angular'
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms'
import {debugLog} from '../../utils/log'
import {EditorService} from './editor.service'
import {richTextEditCommon} from './RichTextEditCommon'
import {cellDirections, CellNavigationService} from '../../cell-navigation.service'
import {AbstractCellComponent} from '../../AbstractCellComponent'
import {getSelectionCursorState} from '../../utils/caret-utils'
import {LinkPreviewService} from '../link-preview/link-preview.service'
import {renderLinkPreviewCardHtml, renderLinkPreviewLoadingHtml} from '../link-preview/LinkPreviewCard'
import {convertToHtmlIfNeeded, escapeHtml} from '../../utils/html-utils'
import {BlobSyncService} from '../../odm/blob-sync.service'
import {ModalController} from '@ionic/angular'
import {ImageViewerModalComponent} from '../image-viewer-modal/image-viewer-modal.component'

/**
 * http://ckeditor.github.io/editor-recommendations/about/
 *
 * https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480
 *
 **/
@Component({
    selector: 'app-rich-text-edit',
    templateUrl: './rich-text-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./rich-text-edit.component.sass'],
    imports: [EditorComponent, ReactiveFormsModule],
})
export class RichTextEditComponent extends AbstractCellComponent implements OnInit {

  @Input() viewSyncer ? : ViewSyncer

  @Input() formControl1 ! : UntypedFormControl

  /* TODO maybe put them in one @Input() config or options */
  @Input() placeholder = ''

  @Input() showToolbar = true

  @Input() showMenuBar = true

  /** Off for a field embedded in a dense multi-field list (e.g. Journal/Learn's
   * `TreeNodeCellsComponent` rows via `RichTextEditCellComponent`) - TinyMCE's sticky-toolbar
   * positioning is calculated against the viewport once and doesn't reliably recompute when a
   * *different* field elsewhere on the same page expands/collapses (compact-pill <-> full-row,
   * see `TreeNodeCellsComponent.isCompact()`) or this field is focused programmatically right as
   * that layout shift happens (`focusExpandedCell()`) - the toolbar can end up visually stuck
   * mid-page, overlapping unrelated content instead of docked above its own editor. Left on by
   * default for every other context (a single long-form editor - Learn's answer field, OrYoL's
   * node title - where keeping the toolbar in view while scrolling a long document is the point). */
  @Input() toolbarSticky = true

  /** workaround for searchOrAdd not updating when deleting all text at once */
  @Input() enableModelEventNodeChange = false

  @Input() showClearButton: boolean = false

  /** Used in search-or-add (because enter creates a new item). */
  @Input() enterKeyOnlyWithShift: boolean = false

  /** Fires whenever `enterKeyOnlyWithShift` suppresses a non-shift Enter (any other modifiers
   * included) below - a plain ancestor `(keydown.enter)` binding can't react to this itself,
   * since TinyMCE's own `preventDefault()` here happens before the event bubbles, and consumers
   * like OrYoL's tree explicitly skip already-prevented keydowns to avoid double-handling. Emits
   * the raw event so a caller that actually wants this Enter to do something else (e.g. create a
   * new sibling node) can dispatch on its modifiers itself. */
  @Output() enterKeydownIntercepted = new EventEmitter<KeyboardEvent>()

  /** GH #75: when set, a Backspace pressed while the editor is already empty is intercepted
   * (instead of doing nothing, which is the browser's default for an empty contenteditable) so a
   * caller can delete the whole node it belongs to - matching common outliner-app behavior
   * (Workflowy/Notion/Roam: backspace on an empty line removes it and moves to the previous one). */
  @Input() interceptBackspaceOnEmpty: boolean = false

  /** Fires whenever `interceptBackspaceOnEmpty` suppresses a Backspace on an already-empty editor -
   * same rationale as `enterKeydownIntercepted` above for why this needs to be an output rather
   * than relying on a plain ancestor `(keydown.backspace)` binding. */
  @Output() backspaceOnEmptyIntercepted = new EventEmitter<KeyboardEvent>()

  /** Off by default so a bare pasted URL still just becomes a plain autolink anywhere this
   * component is used for something link previews don't make sense for (kept opt-in rather than
   * risk surprising behavior in an untested context) - Learn/Quiz/Journal/OrYoL explicitly
   * enable it where a link preview card is wanted. */
  @Input() enableLinkPreview = false

  /** Both required together to upload a pasted image as an external blob instead of inline
   * base64 - callers with no current item (e.g. Learn's quick-add bar) simply don't set either,
   * and pasted images fall back to today's inline-base64 behavior unchanged. */
  @Input() collection?: string

  /** A brand new, not-yet-saved item's `id` is only lazily assigned the first time its throttled
   * patch actually reaches OdmService2.saveNowToDb() (confirmed live: `item$.id` starts
   * `undefined` and gets set several seconds later, from inside an RxJS `throttleTime` callback
   * that never triggers Angular change detection - see AskPage's near-identical bug). A plain
   * `@Input() itemId: string` snapshot taken at bind time would freeze at `undefined` forever in
   * that window. Prefer this - it's read fresh off the live object at upload time instead - for
   * any caller whose item might not have an id yet (Learn/Journal); OrYoL's tree nodes always
   * have a real id from creation, so `itemId` below is fine for that simpler case. */
  @Input() itemRef?: {id?: string | null}
  @Input() itemId?: string

  private resolveItemId(): string | undefined {
    return this.itemRef?.id ?? this.itemId ?? undefined
  }

  private _editorViewChild: EditorComponent | undefined

  /* TODO rename editorWasOrIsOpened */
  editorOpened = false

  /** Set by `onEditorInit()` (bound to the `<editor>`'s own `(onInit)` output) - `focusEditor()`
   * calling `editor.focus()` before TinyMCE has actually finished constructing this instance
   * throws ("Cannot read properties of undefined (reading 'getRng')", from TinyMCE's selection
   * bookmarking) instead of silently no-oping. Surfaced by OrYoL's `/tree`, which - unlike this
   * component's other callers - focuses a cell immediately after creating it (Enter/Alt+Enter/
   * Append all auto-focus the brand new row), landing well inside that initialization window. */
  private editorReady = false

  private focusPending = false

  @ViewChild(EditorComponent)
  set editorViewChild(ed: EditorComponent | undefined) {
    if ( ed ) {
      setTimeout(() => {
        this.editorOpened = true /* prevent tinymce side editor from disappearing after deleting content:
          for preserving undo and to prevent tinymce error when disappeared
          */
      }, 10)
    }
    this._editorViewChild = ed
  }

  get editorViewChild() {
    return this._editorViewChild
  }


  tinyMceInit: any

  constructor(
    public editorService: EditorService,
    private linkPreviewService: LinkPreviewService,
    private blobSyncService: BlobSyncService,
    private modalController: ModalController,
    injector: Injector
  ) {
    super(injector)
  }

  /** Finds bare-URL autolink anchors (text === href) under `root` that haven't been through this
   * already (tracked via `data-link-preview-attempted`, since the fallback-on-failure anchor
   * below is otherwise indistinguishable from a fresh one and would get endlessly re-fetched on
   * every subsequent space/Enter elsewhere in the document) and swaps each for a preview card. */
  private convertBareUrlAnchorsToLinkPreviews(editor: any, root: HTMLElement) {
    const anchors: HTMLAnchorElement[] = Array.from(root.querySelectorAll('a[href]:not([data-link-preview-attempted])'))
    for ( const anchor of anchors ) {
      const href = anchor.getAttribute('href') || ''
      const text = anchor.textContent?.trim() || ''
      if ( ! /^https?:\/\//i.test(href) || text !== href ) {
        continue
      }
      this.replaceAnchorWithLinkPreviewCard(editor, anchor, href)
    }
  }

  /** Swaps a bare-URL autolink for a loading placeholder immediately, then for the real
   * link-preview card (or, on failure/timeout, back to a plain link) once the fetch resolves -
   * never blocks typing/pasting on the network round-trip. */
  private replaceAnchorWithLinkPreviewCard(editor: any, anchor: HTMLAnchorElement, url: string) {
    const placeholderId = 'link-preview-' + Math.random().toString(36).slice(2)
    anchor.outerHTML = renderLinkPreviewLoadingHtml(url, placeholderId)
    this.linkPreviewService.fetchPreview(url).then(result => {
      const placeholderEl = editor.getBody()?.querySelector('#' + placeholderId)
      if ( ! placeholderEl ) {
        return // user already edited/undid this before the fetch resolved
      }
      if ( result.fetchStatus !== 'ok' || ! result.title ) {
        const escapedUrl = escapeHtml(url)
        placeholderEl.outerHTML = `<a href="${escapedUrl}" data-link-preview-attempted="true">${escapedUrl}</a>`
        return
      }
      placeholderEl.outerHTML = renderLinkPreviewCardHtml(result)
    })
  }

  /** Finds not-yet-processed pasted images under `root` and hands each to `uploadPastedImage` -
   * separated out mainly so the per-image logic below can `await` without holding up the
   * `SetContent` handler itself. Two distinct src shapes to handle: a `data:` URI (HTML pasted
   * from elsewhere - e.g. Word - that already embeds a base64 image), or a `blob:` URI (confirmed
   * live: a real OS-clipboard image paste, e.g. a screenshot, goes through TinyMCE's own internal
   * blob-cache mechanism instead and never appears as a data: URI at all - an earlier
   * data:-only implementation missed this, the actually-common, case entirely). Marks each image
   * immediately (synchronously) so `SetContent` firing again before the async upload below
   * finishes - it fires on every keystroke, not just paste - doesn't kick off a duplicate upload
   * of the same image; the swapped-in final `src` is itself a fresh `blob:` URL, which the
   * `:not(...)` here excludes it from ever matching again regardless. */
  private convertInlineImagesToBlobs(editor: any, root: HTMLElement) {
    const images: HTMLImageElement[] = Array.from(root.querySelectorAll('img[src^="data:image"]:not([data-blob-upload-pending]), img[src^="blob:"]:not([data-blob-upload-pending])'))
    for ( const img of images ) {
      img.setAttribute('data-blob-upload-pending', 'true')
      this.uploadPastedImage(editor, img)
    }
  }

  /** Uploads a pasted image as two linked blobs - the full-size original (`kind:
   * 'image-original'`) plus a resized ~400x300 thumbnail (`kind: 'image-thumbnail'`, `
   * original_blob_id` pointing back at the original) - satisfying GH #32's "paste full-size or
   * paste clickable thumbnail" ask by always doing both: the thumbnail is what's shown inline
   * (fast, small), and it's marked `data-original-blob-id` so `onEditorClick` below can open the
   * full-size original on click, rather than forcing an upfront choice the user has no time to
   * notice at paste time. Swaps the pasted image's `src` for the thumbnail's local object URL
   * once the (still-local, cache-first) upload call resolves - never a data: URI or TinyMCE's own
   * transient blob-cache entry in the saved HTML from here on. */
  private async uploadPastedImage(editor: any, img: HTMLImageElement) {
    const itemId = this.resolveItemId()
    if ( ! this.collection || ! itemId ) {
      return
    }
    const src = img.getAttribute('src') || ''
    let imageSource: Blob | string
    if ( src.startsWith('data:image') ) {
      imageSource = src
    } else if ( src.startsWith('blob:') ) {
      const blobInfo = editor.editorUpload?.blobCache?.getByUri(src)
      if ( ! blobInfo ) {
        return
      }
      imageSource = blobInfo.blob()
    } else {
      return
    }
    const originalBlob = typeof imageSource === 'string' ? await (await fetch(imageSource)).blob() : imageSource
    const thumbnailBlob = await this.makeThumbnailBlob(imageSource)
    if ( ! thumbnailBlob ) {
      return // leave the pasted image as-is rather than losing it
    }
    const originalBlobId = await this.blobSyncService.upload(this.collection, itemId, originalBlob, 'image-original', originalBlob.type || 'image/png')
    const thumbnailBlobId = await this.blobSyncService.upload(this.collection, itemId, thumbnailBlob, 'image-thumbnail', 'image/webp', originalBlobId)
    img.setAttribute('data-blob-id', thumbnailBlobId)
    img.setAttribute('data-original-blob-id', originalBlobId)
    img.setAttribute('title', 'Click to view full size')
    img.setAttribute('src', URL.createObjectURL(thumbnailBlob))
  }

  /** Opens the full-size original in an in-app modal when a thumbnail (`data-original-blob-id`,
   * see `uploadPastedImage`) is clicked - the "clickable thumbnail" half of GH #32, available for
   * both freshly-pasted images and ones hydrated back from a previous session.
   *
   * Deliberately not `window.open(objectUrl, '_blank')` (GH #53): an object URL only resolves in
   * the document that created it - opening it in a new tab is unreliable even in the same
   * browser (Chrome's Blob URL Partitioning) and never works after a reload or in a different
   * browser. A same-page modal has no such cross-context requirement. */
  private async onEditorImageClick(event: any) {
    const target = event.target as HTMLElement
    if ( target?.tagName !== 'IMG' ) {
      return
    }
    const originalBlobId = target.getAttribute('data-original-blob-id')
    if ( ! originalBlobId ) {
      return
    }
    const blob = await this.blobSyncService.resolve(originalBlobId)
    if ( ! blob ) {
      return
    }
    const modal = await this.modalController.create({
      component: ImageViewerModalComponent,
      componentProps: {imageUrl: URL.createObjectURL(blob)},
    })
    await modal.present()
  }

  private makeThumbnailBlob(source: Blob | string): Promise<Blob | undefined> {
    return new Promise(resolve => {
      const image = new Image()
      const objectUrlToRevoke = typeof source === 'string' ? undefined : URL.createObjectURL(source)
      const cleanup = () => { if ( objectUrlToRevoke ) URL.revokeObjectURL(objectUrlToRevoke) }
      image.onload = () => {
        const maxWidth = 400, maxHeight = 300
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
        const width = Math.round(image.width * scale)
        const height = Math.round(image.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if ( ! ctx ) {
          cleanup()
          resolve(undefined)
          return
        }
        ctx.drawImage(image, 0, 0, width, height)
        canvas.toBlob(blob => {
          cleanup()
          resolve(blob ?? undefined)
        }, 'image/webp', 0.85)
      }
      image.onerror = () => {
        cleanup()
        resolve(undefined)
      }
      image.src = objectUrlToRevoke ?? (source as string)
    })
  }

  /** A pasted image with no `data-blob-upload-pending` marker yet (i.e. genuinely new, not
   * already mid-upload/uploaded) - used below to decide whether a missing item id is actually
   * worth forcing, without unconditionally flushing on every keystroke of every field. */
  private hasUnprocessedPastedImage(editor: any): boolean {
    return !! editor.getBody()?.querySelector('img[src^="data:image"]:not([data-blob-upload-pending]), img[src^="blob:"]:not([data-blob-upload-pending])')
  }

  private retryPendingBlobWork(editor: any) {
    this.hydrateBlobImages(editor)
    if ( ! this.collection ) {
      return
    }
    if ( ! this.resolveItemId() && this.hasUnprocessedPastedImage(editor) ) {
      // A brand-new, never-yet-saved item's id is only assigned the first time patchThrottled()
      // actually runs - pasting an image as the very first action (no preceding keystroke)
      // would otherwise leave resolveItemId() undefined forever, since nothing else triggers
      // that first patch here. convertInlineImagesToBlobs() below is itself gated on having an
      // id, so without this the image gets marked data-blob-upload-pending on the very next
      // pass regardless and is then never retried, permanently un-uploaded (GH #53). Forcing a
      // flush is a no-op if a save already went through, same as ViewSyncer.flush()'s other
      // callers.
      this.viewSyncer?.flush()
    }
    if ( this.resolveItemId() ) {
      this.convertInlineImagesToBlobs(editor, editor.getBody())
    }
  }

  /** Resolves `data-blob-id` references (saved instead of inline base64 - see
   * `uploadPastedImage`) to a live object URL on every render, since object URLs don't survive a
   * reload. Marks each image `data-blob-hydrating` immediately upon starting (not yet
   * `data-blob-hydrated`) so `SetContent` firing again mid-resolve (e.g. the user typing
   * elsewhere) doesn't kick off a duplicate resolve for the same image - `data-blob-hydrated` is
   * only set once resolve() actually succeeds. A failed resolve (e.g. BlobSyncService.resolve()
   * racing auth-ready on first load, or a transient network blip) instead clears the in-flight
   * marker so the image is retried on the next keyup/SetContent pass, rather than being silently
   * abandoned as a permanently-broken thumbnail (GH #64). */
  private hydrateBlobImages(editor: any) {
    const images: HTMLImageElement[] = Array.from(editor.getBody()?.querySelectorAll('img[data-blob-id]:not([data-blob-hydrated]):not([data-blob-hydrating])') ?? [])
    for ( const img of images ) {
      const blobId = img.getAttribute('data-blob-id')
      if ( ! blobId ) {
        continue
      }
      img.setAttribute('data-blob-hydrating', 'true')
      this.blobSyncService.resolve(blobId).then(blob => {
        img.removeAttribute('data-blob-hydrating')
        if ( ! blob ) {
          return // leave un-hydrated - retried next time hydrateBlobImages() runs
        }
        img.setAttribute('data-blob-hydrated', 'true')
        img.setAttribute('src', URL.createObjectURL(blob))
      })
    }
  }

  override ngOnInit() {
    super.ngOnInit()
    this.tinyMceInit = {
      base_url: '/assets/tinymce', // Root for resources
      suffix: '.min',        // Suffix to use when loading resources
      /* https://www.tiny.cloud/docs/integrations/angular/
      * https://www.tiny.cloud/docs/tinymce/6/invalid-api-key/#what-will-happen-if-i-dont-provide-a-valid-api-key
      * https://www.tiny.cloud/blog/get-started-with-tinymce-self-hosted/
      * https://www.tiny.cloud/get-tiny/self-hosted/
      * https://www.tiny.cloud/docs/general-configuration-guide/advanced-install/#packagemanagerinstalloptions
      * https://chat.openai.com/c/4daefc17-f0da-40b8-bd25-a2f229081025 --> this gave the info that made it work: angular.json:
      *     "scripts": [
              "src/assets/tinymce/tinymce.min.js"
            ],
      *  */


      // placeholder: "Search or add" /* https://www.tiny.cloud/blog/tinymce-placeholder-text/ */,
      placeholder: this.placeholder,
      height: 500,
      menubar: this.showMenuBar,
      mobile: { /** https://www.tiny.cloud/docs/mobile/#configuringmobile */
        /* TODO try toolbar_sticky in mobile: https://www.tiny.cloud/docs/configure/editor-appearance/#toolbar_sticky */
        menubar: this.showMenuBar /* https://www.tiny.cloud/docs/configure/editor-appearance/#menubar */,
        // menubar_mode: 'scrolling',
        // toolbar_mode: 'scrolling',
        menu: { /* https://www.tiny.cloud/docs/configure/editor-appearance/#menu */
          file: {title: 'File', items: 'newdocument restoredraft | preview | print '},
          edit: {title: 'Edt', items: 'undo redo | cut copy paste | selectall | searchreplace'},
          view: {title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen'},
          insert: {
            title: 'Ins',
            items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime'
          },
          format: {
            title: 'Fmt',
            items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat'
          },
          tools: {title: 'Tls', items: 'spellchecker spellcheckerlanguage | code wordcount'},
          table: {title: 'Tbl', items: 'inserttable | cell row column | tableprops deletetable'},
          help: { title: 'Hlp', items: 'help' }
        }
      },
      toolbar_location: 'auto', // 'bottom', /* https://www.tiny.cloud/docs/configure/editor-appearance/ */
      toolbar_sticky: this.toolbarSticky,
      // menubar: false,
      statusbar: false,
      plugins: [
        // https://www.tiny.cloud/docs/plugins/opensource/
        'advlist autolink lists image charmap print preview anchor' /* link */,
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount hr'
      ],
      formats: { /* https://www.tiny.cloud/docs/demo/format-custom/ --> CodePen; also check badge format
      https://www.tiny.cloud/docs/configure/content-formatting/#built-informats
      */
        done: {inline: 'span', classes: 'done-text'},
        fancy: {inline: 'span', classes: 'fancy'},
        warning: {inline: 'span', classes: 'warning'},
        negative: {inline: 'span', classes: 'negative'},
        positive: {inline: 'span', classes: 'positive'},
        concept: {inline: 'span', classes: 'concept'},
        sourceCode: {inline: 'pre', classes: 'source-code'},
      },
      style_formats: [ /* https://www.tiny.cloud/docs/demo/format-html5/ */
        {
          title: `Fancy`,
          format: 'fancy',
        },
        {
          title: `Negative`,
          format: 'negative',
        },
        {
          title: `Warning`,
          format: 'warning',
        },
        {
          title: `Positive`,
          format: 'positive',
        },
        {
          title: `Concept`,
          format: 'concept',
        },
        { title: 'Headers', items: [
            { title: 'h1', block: 'h1' },
            { title: 'h2', block: 'h2' },
            { title: 'h3', block: 'h3' },
            { title: 'h4', block: 'h4' },
            { title: 'h5', block: 'h5' },
            { title: 'h6', block: 'h6' }
          ] },

        { title: 'Blocks', items: [
            { title: 'p', block: 'p' },
            { title: 'div', block: 'div' },
            { title: 'pre', block: 'pre' },
            { title: 'code', format: 'sourceCode' },
          ] },

        { title: 'Containers', items: [
            { title: 'section', block: 'section', wrapper: true, merge_siblings: false },
            { title: 'article', block: 'article', wrapper: true, merge_siblings: false },
            { title: 'blockquote', block: 'blockquote', wrapper: true },
            { title: 'hgroup', block: 'hgroup', wrapper: true },
            { title: 'aside', block: 'aside', wrapper: true },
            { title: 'figure', block: 'figure', wrapper: true }
          ] }
      ],
      paste_data_images: true /* https://www.tiny.cloud/docs/plugins/paste/ */,
      paste_retain_style_properties: 'all', // https://www.tiny.cloud/docs/plugins/powerpaste/ - PowerPaste plugin - (30 eur/month?)
      /* https://www.tiny.cloud/pricing/ -- 30/month - BUT about pasting from Linguee - this should be automated by extension anyway, so probably not worth over-investing in tinymce for that
        see #LingueeService
      * */

      // toolbar: false, // https://stackoverflow.com/questions/2628187/tinymce-hide-the-bar
      toolbar: this.showToolbar ?
        'customMarkBtn btnFormatDone btnFormatPositive btnFormatNegative btnFormatWarning btnFormatFancy btnFormatConcept \
        bullist numlist outdent indent | bold italic underline strikethrough blockquote forecolor backcolor | \
        selectall copy paste | undo redo | \
        formatselect | hr | \
        alignleft aligncenter alignright alignjustify ' /* align is probably quite useless for notes */ +
        ' | removeformat | help' : false,
      skin: 'oxide-dark',
      // content_css: 'dark', /* is causing error on console, as this is url part */  // > **Note**: This feature is only available for TinyMCE 5.1 and later.
      entity_encoding: `raw`,
      /** https://www.tiny.cloud/docs/configure/content-filtering/#valid_classes */
      valid_classes: richTextEditCommon.valid_classes,
      // CRITICAL: `inline: true` (see rich-text-edit.component.html) means this editor sits
      // directly on the surrounding page's own background, not inside its own iframe/chrome - but
      // the 'oxide-dark' skin above still ships a hardcoded light/white default text+caret color
      // for its content area, sized for a dark editor chrome. Since this app randomizes between
      // light and dark themes on every visit (app.component.ts's applyRandomTheme()), that default
      // goes invisible - white text and a white cursor on whatever light theme happened to be
      // picked. Forcing both onto the same --ion-text-color the rest of the app already keeps
      // correctly contrasted against the live background (see apply-theme.ts's getIonicTextColor())
      // fixes it for every theme, light or dark, without needing to sync TinyMCE's skin choice to
      // the current theme at all.
      content_style: 'img[data-original-blob-id] { cursor: zoom-in; } ' +
        '[contenteditable] { color: var(--ion-text-color); caret-color: var(--ion-text-color); } '
      // '[contenteditable] { padding-left: 5px; } ' +
      // // '[contenteditable] ul { padding-inline-start: 1rem; } ' +
      // // '[contenteditable] li { padding-top: 6px; } ' +
      // // '[contenteditable] ::marker { color: var(--secondary); ' +
      // '[contenteditable] ul ::marker { color: var(--secondary); ' +
      // '[contenteditable] ::marker { color: var(--secondary); ' +
      //   '/* does not seem to work: */ text-shadow: 2px 2px #ffffff; } ' +
      // `blockquote { border-left: 3px var(--secondary) solid; padding-left: 6px; margin-left: 20px } ` + /* TODO: extract standard rich text css into global const for -edit and -view */
      // `ul { padding-inline-start: 0px; }` +
      // `ol { padding-inline-start: 20px; }` +
      // `section { border: 2px solid #b02020; padding: 3px; margin: 2px; border-radius: 4px;  }` +
      // `ul { border: 2px solid #101010; padding: 3px; margin: 2px; border-radius: 4px;  }` +
      // + `ol { border-left: 2px solid #801010; }`
      // + `ul { border-left: 2px solid #801010; }`
      // `ol { border: 2px solid #101010; padding: 3px; margin: 2px; border-radius: 4px;  }`
      /* https://www.tiny.cloud/docs/configure/content-appearance/
        padding to be able to see cursor when it's close to focus border
        [contenteditable] a { color: #98aed9 }
        */,
      setup: (editor: any) => {
        console.log('setup')
        // Every programmatic content replacement (the tinymce-angular wrapper's writeValue(),
        // called whenever formControl1.setValue() runs - e.g. a reactive re-sync from
        // NodeContentViewSyncer/ViewSyncer racing an in-progress edit, or any other caller that
        // sets this control's value) goes through editor.setContent() under the hood, which always
        // collapses the caret to the very start of the document - TinyMCE has no built-in "keep the
        // cursor where it was" option for this. Only bother saving/restoring while this editor
        // actually has focus: an update landing while the user is elsewhere has no cursor here
        // worth preserving, and skipping it avoids stealing focus via moveToBookmark(). A bookmark
        // (not a plain numeric offset) survives the surrounding content changing shape somewhat;
        // if it still fails to resolve against genuinely different content, restoring is simply
        // skipped rather than throwing - same "best-effort, never worse than the reset" trade-off
        // as leaving the caret whereever setContent put it.
        let pendingCaretBookmark: any
        editor.on('BeforeSetContent', () => {
          if (editor.hasFocus()) {
            pendingCaretBookmark = editor.selection.getBookmark(2, true)
          }
        })
        editor.on('SetContent', () => {
          if (pendingCaretBookmark) {
            const bookmarkToRestore = pendingCaretBookmark
            pendingCaretBookmark = undefined
            try {
              editor.selection.moveToBookmark(bookmarkToRestore)
            } catch {
              // Content changed too much for this bookmark to resolve - leave the caret as-is
              // rather than throwing.
            }
          }
        })
        editor.on('PastePreProcess', (event: any) => {
          // Work around a long-standing, still-unfixed TinyMCE bug (tinymce/tinymce#6629):
          // its paste-image scanner assumes any `data:...;base64,` <img> src it finds has a
          // real payload after the comma, but pasted content can carry a `data:` image src
          // that's empty, non-base64 (e.g. an unencoded `data:image/svg+xml,...`), or
          // otherwise malformed - unpacking that then hands the scanner an undefined base64
          // string, and it throws "blob and base64 representations of the image are required
          // for BlobInfo to be created" instead of just skipping that one image. Strip only
          // the malformed ones here so a bad image drops silently rather than erroring.
          event.content = event.content.replace(/<img\b[^>]*>/gi, (imgTag: string) => {
            const srcMatch = /\ssrc=(["'])(data:[^"']*)\1/i.exec(imgTag)
            if (!srcMatch) {
              return imgTag
            }
            const isWellFormedBase64DataUri = /data:[^;]+;base64,[a-z0-9+/=\s]+/i.test(srcMatch[2])
            return isWellFormedBase64DataUri ? imgTag : ''
          })
        })
        editor.on('PastePostProcess', (event: any) => {
          // Covers pasting HTML that already contains a bare-url anchor (e.g. copied from
          // another app) - autolink itself does NOT convert a plain-text pasted URL immediately
          // (confirmed: it only fires on a trailing space/Enter keystroke, handled below), so this
          // alone would miss the common "paste a bare URL" case.
          if ( ! this.enableLinkPreview ) {
            return
          }
          this.convertBareUrlAnchorsToLinkPreviews(editor, event.node)
        })
        editor.on('keyup', (event: any) => {
          // Mirrors autolink's own trigger: it converts a just-typed/pasted bare URL into
          // <a href>url</a> only once a trailing space or Enter follows it, not at paste time.
          // Deferred a tick (GH #63): confirmed live that TinyMCE's own autolink plugin hasn't
          // necessarily created that <a href> yet by the time this same keyup handler runs - a
          // querySelectorAll() here would find nothing, and (since nothing else re-triggers this
          // check) the URL would sit as a plain unconverted link forever unless the user happened
          // to type another space/Enter later. autolink has always finished by the next tick.
          if ( this.enableLinkPreview && (event.key === ' ' || event.key === 'Enter') ) {
            setTimeout(() => this.convertBareUrlAnchorsToLinkPreviews(editor, editor.getBody()))
          }
          // Retries pending blob uploads/hydration on every keystroke - both are already no-ops
          // when there's nothing new to do (the `:not(...)` exclusions inside each), and this is
          // the only reliable retry point for a brand new, not-yet-saved item: `SetContent` only
          // fires for bulk operations (paste, programmatic setContent), never per-keystroke
          // typing, but a new item's `id` is assigned asynchronously well after paste time (see
          // `itemRef`'s doc comment above) - without a broader retry trigger, an image pasted
          // before that id exists would never get uploaded at all.
          this.retryPendingBlobWork(editor)
        })
        editor.on('click', (event: any) => {
          this.onEditorImageClick(event)
        })
        editor.on('SetContent', () => {
          // Runs on every content change (including the user's own typing, harmlessly re-running
          // against an empty selector match), not just paste - also covers the initial load of
          // previously-saved content containing data-blob-id references from an earlier session.
          // Deliberately NOT hooked to PastePostProcess: confirmed live that a real OS-clipboard
          // image paste (e.g. a screenshot) never fires PastePreProcess/PastePostProcess at all -
          // those only cover pasted *HTML*. TinyMCE inserts a raw image paste through a separate
          // internal path directly into the editor body, landing it in SetContent instead.
          this.retryPendingBlobWork(editor)
        })
        editor.on('keydown', (event: any) => {
          if ( this.enterKeyOnlyWithShift ) {
            if (event.keyCode == 13) {
              if ( ! event.shiftKey ) {
                // NOTE - this is what prevented alt+enter?
                // .shiftKey .metaKey .altKey .ctrlKey
                // console.log(`Enter key`, event)
                event.preventDefault();
                event.stopPropagation();
                this.enterKeydownIntercepted.emit(event)
                // TinyMCE's own keydown handling runs outside Angular's zone (the
                // @tinymce/tinymce-angular wrapper calls into NgZone.runOutsideAngular for
                // performance), so everything this triggers synchronously - including
                // time-tracking pausing/resuming on other tree nodes entirely, per GH issue #33 -
                // updates its underlying data correctly but never gets picked up on screen until
                // some unrelated zone-tracked event happens to trigger a change-detection tick.
                // Same fix as BaseComponent's FeatureService subscription and AskPage's debounced
                // search for the same class of bug.
                this.injector.get(ChangeDetectorRef).markForCheck()
                return false;
              }
            }
          }
          if ( this.interceptBackspaceOnEmpty && event.keyCode === 8 && ! event.shiftKey && ! event.altKey && ! event.metaKey && ! event.ctrlKey ) {
            // Checked against the editor's live content (not the `formControl`/@Input value,
            // which can lag behind same-keystroke edits) - only intercept when there's genuinely
            // nothing left to delete, so a normal backspace-deletes-a-character keystroke is
            // never swallowed.
            // TinyMCE can leave zero-width caret markers after the last visible character is
            // deleted. They are not user content, but `.trim()` intentionally keeps them.
            if ( editor.getContent({format: 'text'}).replace(/[\u200B\uFEFF]/g, '').trim() === '' ) {
              event.preventDefault()
              event.stopPropagation()
              this.backspaceOnEmptyIntercepted.emit(event)
              this.injector.get(ChangeDetectorRef).markForCheck() // see enterKeydownIntercepted's comment above for why
              return false
            }
          }
          /// ==== new:
          // /* prevent alt+enter */
          // if (event.altKey && event.keyCode == 13) {
          //   console.log(`editor.on('keydown'`)
          //   event.stopPropagation();
          //   event.preventDefault();
          //   // You can add any additional code here to handle the Alt+Enter event
          // }
        });
        editor.addShortcut(
          'meta+e', 'Add yellow highlight to selected text.', () => {
            // https://www.tiny.cloud/docs/advanced/keyboard-shortcuts/
            this.highlightSelected(editor)
          });
        editor.addShortcut(
          'ctrl+m', 'Add yellow highlight to selected text.', () => {
            // https://www.tiny.cloud/docs/advanced/keyboard-shortcuts/
            this.highlightSelected(editor)
          });
        editor.addShortcut('ctrl+8', 'Bullet points style', function(){
          editor.execCommand('InsertUnorderedList');
        });
        editor.addShortcut('ctrl+shift+b', 'Numbered Bullet points style', function(){
          editor.execCommand('InsertOrderedList');
        });
        editor.addShortcut('ctrl+d', 'Done style ', function(){
          editor.formatter.toggle('done');
        });
        editor.addShortcut('ctrl+p', 'Positive style ', function(){
          editor.formatter.toggle('positive');
        });
        editor.addShortcut('ctrl+e', 'Positive style ', function(){
          editor.formatter.toggle('positive');
        });
        editor.addShortcut('ctrl+n', 'Negative style ', function(){
          editor.formatter.toggle('negative');
        });
        editor.addShortcut('ctrl+w', 'Warning style ', function(){
          editor.formatter.toggle('warning');
        });
        editor.addShortcut('ctrl+f', 'Fancy style ', function(){
          editor.formatter.toggle('fancy');
        });
        editor.addShortcut('ctrl+shift+c', 'Concept style ', function(){
          editor.formatter.toggle('concept');
        });
        editor.ui.registry.addButton('customMarkBtn', {
          /* https://www.tiny.cloud/docs/demo/custom-toolbar-button/ */
          text: 'M',
          onAction: () => {
            this.highlightSelected(editor)
            // editor.insertContent('&nbsp;<strong>It\'s my button!</strong>&nbsp;');
          } /* for fancy: `mceToggleFormat` ? - https://www.tiny.cloud/docs/advanced/editor-command-identifiers/ */
        });
        editor.ui.registry.addButton('btnFormatPositive', {
          text: 'P',
          onAction: () => {
            this.formatPositive(editor)
          } /* for fancy: `mceToggleFormat` ? - https://www.tiny.cloud/docs/advanced/editor-command-identifiers/ */
        }); //  btnFormatWarning btnFormatFancy btnFormatConcept
        editor.ui.registry.addButton('btnFormatNegative', {
          text: 'N',
          onAction: () => {
            this.formatNegative(editor)
          }
        });
        editor.ui.registry.addButton('btnFormatWarning', {
          text: 'W',
          onAction: () => {
            this.formatWarning(editor)
          }
        });
        editor.ui.registry.addButton('btnFormatFancy', {
          text: 'F',
          onAction: () => {
            this.formatFancy(editor)
          }
        });
        editor.ui.registry.addButton('btnFormatConcept', {
          text: 'C',
          onAction: () => {
            this.formatConcept(editor)
          }
        });
        editor.ui.registry.addButton('btnFormatDone', {
          text: 'D',
          onAction: () => {
            this.formatDone(editor)
          }
        });
      }
    }

  }


  public highlightSelected(editor: any) {
    editor.execCommand('hilitecolor', false, /*'#808000'*/ '#ffa626');
  }

  public formatPositive(editor: any) {
    editor.execCommand('mceToggleFormat', true, 'positive');
  }

  public formatNegative(editor: any) {
    editor.execCommand('mceToggleFormat', true, 'negative');
  }

  public formatWarning(editor: any) {
    editor.execCommand('mceToggleFormat', true, 'warning');
  }

  public formatFancy(editor: any) {
    editor.execCommand('mceToggleFormat', true, 'fancy');
  }

  public formatConcept(editor: any) {
    editor.execCommand('mceToggleFormat', true, 'concept');
  }

  public formatDone(editor: any) {
    editor.execCommand('mceToggleFormat', true, 'done');
  }

  logEditor(msg: string) {
    // debugLog(`tinymce: `, msg)
  }

  /** Content already in the field *before* the recording currently in progress started - the
   * fixed prefix `updateLiveTranscript()` keeps re-appending the (still-changing) interim
   * paragraph onto, so each update *replaces* that trailing paragraph instead of stacking a new
   * one per word. `undefined` between recordings (no live transcript in progress). */
  private liveTranscriptBaselineHtml?: string

  /** Live-updates the in-progress recording's transcript as its own trailing paragraph, replacing
   * it on every call (interim results arrive repeatedly as speech is recognized) rather than
   * overwriting whatever else was already in the field. Appends rather than inserting at the
   * caret, matching `insertTranscript()`'s reasoning - the field may not even be focused while
   * recording. Multiple recordings on the same field each get their own baseline (see
   * `finalizeLiveTranscript()`), so they accumulate as separate paragraphs rather than each
   * replacing the last.
   *
   * GH #80: the `voice-dictated` class (styled in global.scss) marks the paragraph as
   * voice-dictated rather than silently merging it into whatever text was already there - its own
   * `<p>` already keeps it visually separate. */
  updateLiveTranscript(text: string) {
    this.liveTranscriptBaselineHtml ??= this.formControl1.value ?? ''
    this.formControl1.setValue(this.liveTranscriptBaselineHtml + `<p class="voice-dictated">${escapeHtml(text)}</p>`)
  }

  /** Locks in the current content as the new baseline, so the *next* recording's live updates
   * append a fresh paragraph after this one instead of continuing to replace it. */
  finalizeLiveTranscript() {
    this.liveTranscriptBaselineHtml = undefined
  }

  /** One-shot version of `updateLiveTranscript()`/`finalizeLiveTranscript()` for callers that
   * only ever get a single final transcript (no interim updates) - Learn's answer side, OrYoL's
   * node-title field. */
  insertTranscript(transcript: string) {
    this.updateLiveTranscript(transcript)
    this.finalizeLiveTranscript()
  }

  focusEditor() {
    if ( ! this.editorReady ) {
      // Editor isn't constructed yet - defer instead of calling into a half-built TinyMCE
      // instance. onEditorInit() below replays this once (onInit) actually fires.
      this.focusPending = true
      return
    }
    setTimeout(() => {
      // debugLog(`focusEditor`, this.editorViewChild)
      this.editorViewChild ?. editor ?. focus()
    }, 10)
  }

  /** Bound to `<editor>`'s `(onInit)` output - see `editorReady`'s doc comment above.
   *
   * Also self-heals a leading/trailing blank line here (HTML-aware, not a plain string .trim()) -
   * a defensive backstop on top of ViewSyncer.applyFromDb() already doing this for the common
   * (DB-synced) case, covering any other caller that sets formControl1's value directly, and any
   * already-corrupted value saved before convertToHtmlIfNeeded()'s fix. {emitEvent: false} because
   * this is purely a display correction, not a user edit - it shouldn't trigger a save on its own. */
  onEditorInit() {
    this.editorReady = true
    const current = this.formControl1?.value
    if ( typeof current === 'string' ) {
      const trimmed = convertToHtmlIfNeeded(current)
      if ( trimmed !== current ) {
        this.formControl1.setValue(trimmed, {emitEvent: false})
      }
    }
    if ( this.focusPending ) {
      this.focusPending = false
      this.focusEditor()
    }
  }

  onFocus(b: any) {
    this.editorService.status$.next({
      textEditorFocused: b
    })
    // debugLog(`rich text onFocus`, b) // TODO focusService notify htmlEditorFocused true/false
  }

  public focusCellAbove($event: any) {
    // console.log('focusCellAbove')
    if ( this.feat.buggy && getSelectionCursorState().atStart ) {
      this.cellNavigationService.navigateToCellVisuallyInDirection(cellDirections.up, this)
      // console.log('Will navi up')
    }
  }
  public focusCellBelow($event: any) {
    // console.log('focusCellBelow')
    if ( this.feat.buggy && getSelectionCursorState().atEnd ) {
      // could be ngrx actions
      this.cellNavigationService.navigateToCellVisuallyInDirection(cellDirections.down, this)
      // console.log('Will navi down')
    }
  }

  /* override */ focus() {
    this.focusEditor()
  }

}
