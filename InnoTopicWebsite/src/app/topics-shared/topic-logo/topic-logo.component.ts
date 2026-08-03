import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';
import { Topic } from '@innotopic/topics-ui';
import '@innotopic/topics-ui';

export const defaultIconHeight = 18

/**
 * Thin wrapper around @innotopic/topics-ui's <topic-logo> custom element (the Lit port of
 * this same component). Keeps the original selector/inputs so none of its consumers need
 * to change; the resolution/sizing/rendering logic now all lives in the Lit component.
 */
@Component({
  selector: 'app-topic-logo',
  standalone: true,
  template: `
    <topic-logo
      [topic]="topic()"
      [size]="size()"
      [width]="width()"
      [height]="height()"
      [margin]="margin()"
    ></topic-logo>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopicLogoComponent {
  topic = input.required<Topic | string>();
  size = input(defaultIconHeight);
  /** Only used when the resolved topic has no logoSize - see the Lit component's dimensions logic. */
  width = input<number>();
  height = input<number>();
  margin = input(2);
}
