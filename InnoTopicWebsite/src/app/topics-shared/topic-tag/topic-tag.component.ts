import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';
import { TopicInfoPopoverComponent, TopicInfoTriggerDirective } from '../topic-info/topic-info';
import { TopicLogoComponent } from '../topic-logo/topic-logo.component';
import { TopicSearchService } from '../topic-search.service';

/**
 * A topic's (theme-recolored) logo and name. Topics with an info blurb are clickable: clicking
 * toggles a popover with the blurb (see TopicInfoTriggerDirective).
 */
@Component({
  selector: 'app-topic-tag',
  standalone: true,
  imports: [TopicLogoComponent, TopicInfoTriggerDirective, TopicInfoPopoverComponent],
  template: `
    <span
      class="angular-topic-tag"
      [class.angular-topic-tag--inline]="inline()"
      [appTopicInfoTrigger]="showInfo() ? resolvedTopic() : undefined"
      #topicInfo="topicInfo"
      (click)="clickTopic.emit(resolvedTopic())"
    >
      @if (showLogo() && resolvedTopic()?.logo) {
        <!-- The whole tag is the info trigger, so the logo doesn't get its own. -->
        <app-topic-logo [topic]="resolvedTopic()!" [size]="18" [margin]="6" [showInfoOnClick]="false" />
      }
      {{ displayName() }}
      <ng-content></ng-content>
    </span>
    @if (topicInfo.open()) {
      <app-topic-info-popover [text]="topicInfo.info()!" />
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-block;
      vertical-align: middle;
    }

    .angular-topic-tag {
      display: inline-flex;
      align-items: center;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      vertical-align: middle;
    }

    .angular-topic-tag--inline {
      display: inline-flex;
      align-items: center;
    }

    /* Topic search (see TopicSearchService). Muting fades toward whatever is behind the tag, and the
       match ring pairs the theme's background and text colors, which contrast with each other, so
       one of the two rings stands out on any surface color. */
    :host {
      transition: opacity 0.2s ease, filter 0.2s ease;
    }

    :host(.topic-search--muted) {
      opacity: 0.25;
      filter: grayscale(1);
    }

    :host(.topic-search--match) .angular-topic-tag {
      /* Room for the ring without shifting the surrounding layout; the vertical padding keeps the
         skill-level icon, which hangs slightly below the tag, inside the ring. */
      padding: 3px 4px;
      margin: -3px -4px;
      border-radius: 6px;
      box-shadow:
        0 0 0 2px var(--ion-background-color, #fff),
        0 0 0 4px var(--ion-text-color, #000);
    }
  `],
  host: {
    '[class.topic-search--match]': "searchState() === 'match'",
    '[class.topic-search--muted]': "searchState() === 'muted'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTagComponent {
  private readonly topicsService = inject(TopicsService)

  tId = input.required<string>()
  showLogo = input(true)
  /** Aligns the plain tag with surrounding text; use app-chip for a neumorphic surface. */
  inline = input(false)
  /** Click-to-reveal info popover; turn off where the tag sits inside another popup. */
  showInfo = input(true)

  clickTopic = output<Topic | undefined>()

  /** Looked up with a leading "#" stripped (FIXME for c#) and "#Some_Hashtag" un-mangled back to spaces. */
  protected readonly resolvedTopic = computed(() =>
    this.topicsService.getTopicByIdIfExisting(this.tId().replace('#', '').replace(/_/g, ' ')))
  protected readonly displayName = computed(() => this.resolvedTopic()?.name ?? this.tId())
  private readonly topicSearch = inject(TopicSearchService)
  protected readonly searchState = computed(() => this.topicSearch.stateOf(this.resolvedTopic() ?? this.tId()))
}
