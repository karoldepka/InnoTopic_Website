import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  output,
} from '@angular/core';
import { Topic } from '@innotopic/topics-ui';
import '@innotopic/topics-ui';

/**
 * Thin wrapper around @innotopic/topics-ui's <topic-tag> custom element (the Lit port of
 * this same component - see that package for the actual lookup/popover/highlight logic).
 * Keeps the original selector/inputs/output so none of its ~16 consuming templates need
 * to change.
 */
@Component({
  selector: 'app-topic-tag',
  standalone: true,
  template: `
    <topic-tag
      [tId]="tId()"
      [showLogo]="showLogo()"
      [inline]="inline()"
      (click-topic)="onClickTopic($event)"
    >
      <ng-content></ng-content>
    </topic-tag>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopicTagComponent {
  tId = input.required<string>()
  showLogo = input(true)
  /** Drops the fixed pill font-size/padding so the tag blends into surrounding running text instead of standing out as a discrete tag. */
  inline = input(false)

  clickTopic = output<Topic | undefined>()

  onClickTopic(event: Event) {
    this.clickTopic.emit((event as CustomEvent<Topic | undefined>).detail)
  }
}
