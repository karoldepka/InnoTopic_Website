import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';
import '@innotopic/topics-ui';

// Re-exported for work-project.component.ts, which imports these directly from this file path
// for its own auto-hashtag boundary-detection regex (not just via the component's template).
export { splitIntoHashtagParts, HASHTAG_BODY_CHAR_CLASS } from '@innotopic/topics-ui';
export type { HashtagTextPart } from '@innotopic/topics-ui';

/**
 * Thin wrapper around @innotopic/topics-ui's <topic-hashtag-replacer> custom element (the
 * Lit port of this same component - see that package for the actual #hashtag parsing logic,
 * still the same splitIntoHashtagParts() extracted there for unit-testability).
 */
@Component({
  selector: 'app-hashtag-replacer',
  standalone: true,
  template: `<topic-hashtag-replacer [text]="text()"></topic-hashtag-replacer>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HashtagReplacerComponent {
  text = input('Test Hello #Angular and #Ionic™ ! ');
}
