import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  signal,
} from '@angular/core';
import { Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';

/**
 * Makes its element toggle the topic's info blurb on click / Enter / Space, for topics that have
 * one. Opening one trigger's info closes any other; clicking elsewhere or pressing Escape closes
 * it. Show the blurb with <app-topic-info-popover> while open() is true.
 */
@Directive({
  selector: '[appTopicInfoTrigger]',
  standalone: true,
  exportAs: 'topicInfo',
  host: {
    '[attr.role]': "info() ? 'button' : null",
    '[attr.tabindex]': 'info() ? 0 : null',
    '[attr.aria-expanded]': 'info() ? open() : null',
    '[attr.title]': "info() ? topic()?.name + ' (tap or click to show more info)' : null",
    '[style.cursor]': "info() ? 'pointer' : null",
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class TopicInfoTriggerDirective implements OnDestroy {
  /** The trigger whose info is open. Shared by all triggers, so at most one blurb shows. */
  private static readonly openTrigger = signal<TopicInfoTriggerDirective | undefined>(undefined)

  private readonly topicsService = inject(TopicsService)
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef)

  /** The topic whose blurb to show; undefined disables the trigger. */
  readonly topic = input<Topic | undefined>(undefined, { alias: 'appTopicInfoTrigger' })
  /** Short blurb for the topic, if any (see TopicsService.getTopicInfo). */
  readonly info = computed(() => this.topicsService.getTopicInfo(this.topic()))
  readonly open = computed(() => TopicInfoTriggerDirective.openTrigger() === this)

  onClick(event: Event) {
    if (!this.info()) {
      return
    }
    event.stopPropagation()
    TopicInfoTriggerDirective.openTrigger.set(this.open() ? undefined : this)
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.info() || (event.key !== 'Enter' && event.key !== ' ')) {
      return
    }
    event.preventDefault()
    this.onClick(event)
  }

  /** Closes the info when clicking anywhere outside this trigger. */
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.element.nativeElement.contains(event.target as Node)) {
      this.close()
    }
  }

  close() {
    if (this.open()) {
      TopicInfoTriggerDirective.openTrigger.set(undefined)
    }
  }

  ngOnDestroy() {
    this.close()
  }
}

/** Space kept between the blurb and its anchor, and between the blurb and the screen's edges. */
const ANCHOR_GAP = 4;
const SCREEN_MARGIN = 8;

/**
 * The info blurb shown by a topic trigger. It always fits on screen: placed (fixed) below its
 * anchor, or above it when there's no room below, and shifted sideways to stay inside the screen.
 * It follows the anchor while open (scrolling, moving graph nodes). The anchor is the element it's
 * in, unless given.
 */
@Component({
  selector: 'app-topic-info-popover',
  standalone: true,
  template: `{{ text() }}`,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 20;
      display: block;
      padding: 10px 12px;
      width: max-content;
      max-width: min(280px, calc(100vw - ${2 * SCREEN_MARGIN}px));
      box-sizing: border-box;
      font-size: 13px;
      font-weight: normal;
      line-height: 1.4;
      text-align: left;
      text-indent: 0;
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
  `],
  host: {
    role: 'tooltip',
    // Clicks inside the blurb must not reach the trigger (which would toggle it closed).
    '(click)': '$event.stopPropagation()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicInfoPopoverComponent implements OnDestroy {
  readonly text = input.required<string>()
  /** What the blurb is placed next to; by default, the element it's in. */
  readonly anchor = input<Element | undefined>(undefined)

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly zone = inject(NgZone)
  private frame?: number
  private placed = ''

  constructor() {
    // Follows the anchor every frame while open: cheap (one element), and it covers page and
    // container scrolling, resizing and moving graph nodes alike. Outside Angular: nothing in the
    // app depends on it.
    afterNextRender(() => this.zone.runOutsideAngular(() => this.follow()))
  }

  private follow() {
    this.place()
    this.frame = requestAnimationFrame(() => this.follow())
  }

  private place() {
    const popover = this.host.nativeElement
    const anchor = this.anchor() ?? popover.parentElement
    if (!anchor) return
    const a = anchor.getBoundingClientRect()
    const { offsetWidth: width, offsetHeight: height } = popover
    const screenWidth = document.documentElement.clientWidth
    const screenHeight = window.innerHeight
    const left = Math.max(SCREEN_MARGIN, Math.min(a.left, screenWidth - SCREEN_MARGIN - width))
    const below = a.bottom + ANCHOR_GAP
    const above = a.top - ANCHOR_GAP - height
    const fitsBelow = below + height <= screenHeight - SCREEN_MARGIN
    const top = fitsBelow || above < SCREEN_MARGIN ? below : above
    const position = `${Math.round(left)},${Math.round(top)}`
    if (position === this.placed) return
    this.placed = position
    popover.style.left = `${Math.round(left)}px`
    popover.style.top = `${Math.round(top)}px`
  }

  ngOnDestroy() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame)
  }
}
