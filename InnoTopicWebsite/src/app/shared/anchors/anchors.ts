import { ChangeDetectionStrategy, Component, Directive, inject, Injectable, input } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

/** An id for a section from its title: "Main Experience" → "main-experience", "Málaga" → "malaga". */
export function slugify(text: string): string {
  return text
    .normalize('NFD').replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Makes its element a `#` anchor: sets its id, and marks it (data-anchor) so that scrolling to it
 * stops below the sticky header and topic search (see global.scss).
 */
@Directive({
  selector: '[appAnchor]',
  standalone: true,
  host: {
    '[attr.id]': 'appAnchor()',
    '[attr.data-anchor]': "''",
  },
})
export class AnchorDirective {
  readonly appAnchor = input.required<string>();
}

/** A small "#" link to an anchor: following it puts the anchor in the URL and scrolls to it. */
@Component({
  selector: 'app-anchor-link',
  standalone: true,
  imports: [RouterLink],
  template: `<a routerLink="." [fragment]="anchor()" [attr.aria-label]="'Link to ' + (label() || 'this section')" [title]="'Link to ' + (label() || 'this section')">#</a>`,
  styles: [`
    a {
      padding: 0 4px;
      color: inherit;
      font-weight: normal;
      text-decoration: none;
      opacity: 0.3;
      transition: opacity 0.15s ease;
    }

    a:hover,
    a:focus-visible {
      opacity: 1;
    }

    @media print {
      :host {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnchorLinkComponent {
  readonly anchor = input.required<string>();
  /** What the link points to, for its label ("Link to Rithum"). */
  readonly label = input<string>();
}

/** How long to wait for a fragment's section to render (most of the CV page's sections are deferred). */
const FRAGMENT_WAIT_MS = 15000;
/** How long to keep the section in place while content above it is still rendering. */
const FRAGMENT_SETTLE_MS = 6000;
/** The scroll margin of anchors (global.scss), and how far off it a section may drift. */
const ANCHOR_TOP = 124;
const ANCHOR_TOLERANCE = 8;

/**
 * Scrolls to the URL's fragment after each navigation, once its element exists. The router's own
 * anchor scrolling can't: the page scrolls inside ion-content rather than the window, and most
 * sections render later (@defer). Sections rendering above the target push it down after the
 * scroll, so it's put back in place for a few seconds, until the visitor scrolls themselves.
 */
@Injectable({ providedIn: 'root' })
export class FragmentScrollService {
  private readonly router = inject(Router);
  private timer?: ReturnType<typeof setInterval>;
  private stop?: () => void;

  start() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const fragment = this.router.parseUrl(this.router.url).fragment;
      if (fragment) this.scrollTo(fragment);
    });
  }

  private scrollTo(id: string) {
    this.stop?.();
    const startedAt = Date.now();
    let scrolledAt: number | undefined;
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      const target = document.getElementById(id);
      const now = Date.now();
      if (scrolledAt === undefined) {
        if (target) {
          target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
          scrolledAt = now;
        } else if (now - startedAt > FRAGMENT_WAIT_MS) {
          this.stop?.();
        }
        return;
      }
      if (!target || now - scrolledAt > FRAGMENT_SETTLE_MS) {
        this.stop?.();
        return;
      }
      // Pushed out of place by content rendering above it: put it back (instantly, no animation).
      if (Math.abs(target.getBoundingClientRect().top - ANCHOR_TOP) > ANCHOR_TOLERANCE && now - scrolledAt > 1000) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    };
    // The visitor scrolling, or pressing a key, takes over.
    const takeOver = () => this.stop?.();
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    events.forEach(event => window.addEventListener(event, takeOver, { capture: true, passive: true }));
    this.timer = setInterval(tick, 200);
    this.stop = () => {
      clearInterval(this.timer);
      events.forEach(event => window.removeEventListener(event, takeOver, { capture: true }));
      this.stop = undefined;
    };
    tick();
  }
}
