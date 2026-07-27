import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicLogoComponent } from '../topic-logo/topic-logo.component';
import { ChipComponent } from '../../chip/chip.component';
import { HighlightService } from '../../TopicFriendsShared3/topics-core/highlight.service';
import { Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';

export class TopicInterest {
  // idea: hourly / per-minute rates (in Pro version? :) )
  // name: string;
  constructor(public tagEntry?: Topic,
              // public active?: boolean,
              // public level?: string, // level of expertise

  ) {

  }

  // potential in the future: where. E.g. play soccer where
}

@Component({
  selector: 'app-topic-tag',
  standalone: true,
  imports: [CommonModule, TopicLogoComponent, ChipComponent],
  templateUrl: './topic-tag.component.html',
  styleUrls: ['./topic-tag.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class TopicTagComponent implements OnInit {

  private readonly topicsService = inject(TopicsService)
  private readonly highlightService = inject(HighlightService)
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef)

  /* Input-only for convenience; don't use internally; as it might have been mangled */
  tId = input.required<string>()
  showLogo = input(true)

  clickTopic = output<Topic | undefined>()

  /** tId as actually looked up: strips a leading "#" (FIXME for c#) and un-mangles "#Some_Hashtag" back to spaces. */
  protected readonly normalizedTId = computed(() => this.tId()
    .replace('#', '') // FIXME for c#
    .replace(/_/g, ' ')) // Fix for #Some_Hashtag

  tag = signal(new TopicInterest())
  /** Convenience read-through to tag().tagEntry, since almost everything below only needs the resolved Topic. */
  protected readonly tagEntry = computed(() => this.tag().tagEntry)
  protected readonly displayName = computed(() => this.tagEntry()?.name ?? this.tId())

  /** Short blurb for this topic, if any (see TopicsService.getTopicInfo). Drives the click-to-reveal info popover. */
  info = computed(() => this.topicsService.getTopicInfo(this.tagEntry()))
  showInfo = signal(false)

  isHighlighted = computed(() => this.tagEntry()?.id === this.highlightService.highlightedId())

  ngOnInit() {
    const topicById = this.topicsService.getTopicById(this.normalizedTId())
    // getTopicById() already errorAlert()s when the topic can't be resolved; degrade gracefully here
    // instead of throwing, so one bad tId doesn't break change detection for the rest of the page.
    this.tag.set(new TopicInterest(topicById))
  }

  onMouseEnter() {
    // (Obsolete Comment) this.highlightService.setHighlight(this.tag.tagEntry.id)
  }

  onTagClick(event: Event) {
    this.clickTopic.emit(this.tagEntry())
    if ( ! this.info() ) {
      return
    }
    event.stopPropagation()
    this.showInfo.update(shown => ! shown)
  }

  onTagKeydown(event: KeyboardEvent) {
    if ( ! this.info() || (event.key !== 'Enter' && event.key !== ' ') ) {
      return
    }
    event.preventDefault()
    this.onTagClick(event)
  }

  /** Closes the info popover when clicking anywhere outside this tag. */
  onDocumentClick(event: MouseEvent) {
    if ( this.showInfo() && ! this.elementRef.nativeElement.contains(event.target as Node) ) {
      this.showInfo.set(false)
    }
  }

  onEscape() {
    this.showInfo.set(false)
  }
}
