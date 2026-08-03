import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';
import '@innotopic/topics-ui';

/**
 * Thin wrapper around @innotopic/topics-ui's <topic-chip> custom element (the Lit port of
 * this same component). Keeps the original selector/inputs so none of its consumers need
 * to change; styling now lives entirely in the Lit component's Shadow DOM.
 */
@Component({
  selector: 'app-chip',
  standalone: true,
  template: `
    <topic-chip [forceMouseOver]="forceMouseOver()" [inline]="inline()">
      <ng-content></ng-content>
    </topic-chip>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChipComponent {
  /** Forces the :hover neumorphic shadow to show without an actual pointer hover - for showcases/demos. */
  forceMouseOver = input(false);
  /** Drops the fixed pill font-size/padding so the chip blends into surrounding running text instead of standing out as a discrete tag. */
  inline = input(false);
}
