import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TopicSearchService } from '../topic-search.service';

/**
 * Ctrl+Alt+<letter>, matched by physical key (event.code) so it works on any layout. On Windows
 * Ctrl+Alt is AltGr, which types characters on many layouts (Polish AltGr+C is "ć"): when the
 * keys produce a character, it is typing, not the shortcut.
 */
function isShortcut(event: KeyboardEvent, letter: string): boolean {
  return event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey
    && event.code === `Key${letter}`
    && !(event.key.length === 1 && event.key.toUpperCase() !== letter);
}

/** Topic tags/logos and graph nodes currently highlighted by the search, in page order. */
const MATCH_SELECTOR = '.topic-search--match, .node--search-match';

/**
 * Search box for the page's topics: matching topics are highlighted and all others muted (see
 * TopicSearchService). Ctrl+Alt+F focuses it from anywhere; Enter / Shift+Enter scroll to the
 * next / previous match; Escape clears it; the Aa toggle (Ctrl+Alt+M) matches case, the .* toggle
 * (Ctrl+Alt+R) switches to regex matching.
 */
@Component({
  selector: 'app-topic-search',
  standalone: true,
  template: `
    <label class="topic-search" [class.topic-search--invalid]="search.invalidRegex()">
      <span class="topic-search-icon" aria-hidden="true">⌕</span>
      <input
        #input
        type="search"
        [placeholder]="search.regex() ? 'Search topics (regex)…' : 'Search topics…'"
        aria-label="Search topics (Ctrl+Alt+F); Enter jumps to the next match; Ctrl+Alt+M toggles match case, Ctrl+Alt+R regex"
        aria-keyshortcuts="Control+Alt+F Control+Alt+M Control+Alt+R"
        autocomplete="off"
        spellcheck="false"
        [value]="search.query()"
        (input)="search.query.set(input.value)"
        (keydown.enter)="jump($event, 1)"
        (keydown.shift.enter)="jump($event, -1)"
        (keydown.escape)="clear()"
      />
      @if (search.invalidRegex()) {
        <span class="topic-search-count" aria-live="polite">Invalid regex</span>
      } @else if (search.active()) {
        <span class="topic-search-count" aria-live="polite">
          {{ matchCount() === 0 ? 'No matches' : (current() ? current() + ' / ' : '') + matchCount() + (matchCount() === 1 ? ' match' : ' matches') }}
        </span>
      } @else {
        <kbd class="topic-search-hint" aria-hidden="true">Ctrl+Alt+F</kbd>
      }
      <button
        type="button"
        class="topic-search-toggle"
        [class.topic-search-toggle--on]="search.caseSensitive()"
        [attr.aria-pressed]="search.caseSensitive()"
        aria-label="Match case"
        title="Match case (Ctrl+Alt+M)"
        (click)="toggleCaseSensitive()"
      >Aa</button>
      <button
        type="button"
        class="topic-search-toggle"
        [class.topic-search-toggle--on]="search.regex()"
        [attr.aria-pressed]="search.regex()"
        aria-label="Regular expression"
        title="Regular expression (Ctrl+Alt+R)"
        (click)="toggleRegex()"
      >.*</button>
      @if (search.query()) {
        <button type="button" class="topic-search-clear" aria-label="Clear search" (click)="clear()">×</button>
      }
    </label>
  `,
  styles: [`
    /* Sticky so it stays at hand while scrolling the page. Colors come only from the theme's
       background/text pair, so it reads on any theme, light, dark or custom. */
    :host {
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      justify-content: center;
      padding: 8px 12px;
      background: var(--ion-background-color, #fff);
      color: var(--ion-text-color, #000);
    }

    .topic-search {
      display: flex;
      align-items: center;
      gap: 8px;
      width: min(100%, 520px);
      padding: 4px 6px 4px 12px;
      border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
      border-radius: 999px;
    }

    .topic-search:focus-within {
      border-color: currentColor;
    }

    .topic-search-icon {
      font-size: 18px;
      line-height: 1;
      opacity: 0.7;
    }

    input {
      flex: 1;
      min-width: 0;
      padding: 4px 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: inherit;
      font: inherit;
    }

    input::placeholder {
      color: inherit;
      opacity: 0.55;
    }

    /* The clear button is our own. */
    input::-webkit-search-cancel-button {
      display: none;
    }

    .topic-search-count,
    .topic-search-hint {
      font-size: 12px;
      white-space: nowrap;
      opacity: 0.7;
    }

    .topic-search-hint {
      padding: 1px 6px;
      border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
      border-radius: 4px;
      font-family: inherit;
    }

    /* An unparseable regex: dashed outline instead of a color, which reads on any theme. */
    .topic-search--invalid,
    .topic-search--invalid:focus-within {
      border-style: dashed;
      border-color: currentColor;
    }

    .topic-search-toggle {
      padding: 2px 6px;
      border: 1px solid transparent;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font: 600 12px/1 ui-monospace, monospace;
      opacity: 0.6;
      cursor: pointer;
    }

    .topic-search-toggle:hover {
      opacity: 1;
    }

    .topic-search-toggle--on {
      border-color: currentColor;
      background: color-mix(in srgb, currentColor 14%, transparent);
      opacity: 1;
    }

    .topic-search-clear {
      width: 26px;
      height: 26px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: inherit;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
    }

    .topic-search-clear:hover {
      background: color-mix(in srgb, currentColor 12%, transparent);
    }

    @media print {
      :host {
        display: none;
      }
    }
  `],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSearchComponent {
  protected readonly search = inject(TopicSearchService);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  protected readonly matchCount = signal(0);
  /** 1-based position of the match last jumped to; 0 before the first jump. */
  protected readonly current = signal(0);

  constructor() {
    effect(() => {
      this.search.matcher();
      this.current.set(0);
      // Count once the tags and graph have applied the new query.
      setTimeout(() => this.matchCount.set(this.matches().length));
    });
  }

  protected onDocumentKeydown(event: KeyboardEvent) {
    if (isShortcut(event, 'F')) {
      event.preventDefault();
      this.input().nativeElement.focus();
      this.input().nativeElement.select();
    } else if (isShortcut(event, 'R') || isShortcut(event, 'M')) {
      event.preventDefault();
      if (event.code === 'KeyR') this.toggleRegex();
      else this.toggleCaseSensitive();
      this.input().nativeElement.focus();
    }
  }

  protected toggleRegex() {
    this.search.regex.update(regex => !regex);
  }

  protected toggleCaseSensitive() {
    this.search.caseSensitive.update(caseSensitive => !caseSensitive);
  }

  protected jump(event: Event, step: 1 | -1) {
    event.preventDefault();
    const matches = this.matches();
    this.matchCount.set(matches.length);
    if (!matches.length) return;
    const index = (this.current() - 1 + step + matches.length) % matches.length;
    this.current.set(index + 1);
    matches[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected clear() {
    this.search.query.set('');
    this.input().nativeElement.blur();
  }

  private matches(): Element[] {
    return [...document.querySelectorAll(MATCH_SELECTOR)];
  }
}
