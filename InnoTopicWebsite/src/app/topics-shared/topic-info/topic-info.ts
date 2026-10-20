import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
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

/** The info blurb shown below a topic trigger; its host needs a positioned (e.g. relative) ancestor. */
@Component({
  selector: 'app-topic-info-popover',
  standalone: true,
  template: `{{ text() }}`,
  styles: [`
    :host {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 20;
      display: block;
      margin-top: 4px;
      padding: 10px 12px;
      width: max-content;
      max-width: 280px;
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
export class TopicInfoPopoverComponent {
  readonly text = input.required<string>()
}
