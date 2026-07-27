import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';

export const defaultIconHeight = 18

@Component({
  selector: 'app-topic-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topic-logo.component.html',
  styleUrls: ['./topic-logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicLogoComponent {

  private readonly topicsService = inject(TopicsService)

  debug_showText = false
  // debug_showText = true

  topic = input.required<Topic | string>();
  size = input(defaultIconHeight);
  /** Only used when the resolved topic has no logoSize - see dimensions() below. */
  width = input<number>();
  height = input<number>();
  margin = input(2);

  /** getTopicById() already errorAlert()s when a string id can't be resolved. */
  protected readonly resolvedTopic = computed<Topic | undefined>(() => {
    const topic = this.topic()
    return typeof topic === 'string' ? this.topicsService.getTopicById(topic) : topic
  })

  protected readonly url = computed(() => this.resolvedTopic()?.logo ?? null)

  /**
   * Public (not protected) so it's directly unit-testable; see topic-logo.component.spec.ts.
   * When the resolved topic has a logoSize, it always wins over explicit width()/height() inputs
   * (matches the pre-signals behavior this was migrated from) so odd aspect ratios stay legible.
   */
  readonly dimensions = computed(() => {
    const size = this.size()
    const logoSize = this.resolvedTopic()?.logoSize
    if ( ! logoSize ) {
      return {
        width: this.width() ?? size,
        height: this.height() ?? size,
      }
    }
    const [logoWidth, logoHeight] = logoSize
    return logoHeight > logoWidth
      ? { width: size, height: size * logoHeight / logoWidth }
      : { width: size * logoWidth / logoHeight, height: size }
    // if ( ! this.topic.logoTypeWide ) {
    //   this.styles['width.px'] = this.width // TODO: try limiting width instead of height
    // }
  })

  protected readonly styles = computed(() => ({
    'height.px': this.dimensions().height, // better to specify both width and height, coz less layout jumping on loading
    'margin-right.px': this.margin(),
    'vertical-align': 'middle'
  }))

}
