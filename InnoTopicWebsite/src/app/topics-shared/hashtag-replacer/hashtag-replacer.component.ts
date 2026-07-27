import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicTagComponent } from '../topic-tag/topic-tag.component';

/**
 * Characters allowed inside a #hashtag body (after the leading char).
 * Single source of truth: also used by WorkProjectComponent's auto-hashtag boundary
 * detection, so both agree on what still counts as "part of the tag" (e.g. so that
 * "Gerrit" inside the plain-text word "Gerrit-based" is NOT mistaken for a tag boundary).
 */
export const HASHTAG_BODY_CHAR_CLASS = 'A-Za-z0-9_.+-'

const HASHTAG_REGEX = new RegExp(`#([A-Za-z0-9_][${HASHTAG_BODY_CHAR_CLASS}]*[A-Za-z0-9_+]|[A-Za-z0-9_])`, 'g')

export interface HashtagTextPart {
  text: string;
  isTag: boolean;
  tagText?: string;
}

/** Extracted as a pure function so the parsing logic is unit-testable without spinning up Angular. */
export function splitIntoHashtagParts(text: string): HashtagTextPart[] {
  const parts: HashtagTextPart[] = [];
  HASHTAG_REGEX.lastIndex = 0
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = HASHTAG_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isTag: false });
    }
    parts.push({ text: match[0], isTag: true, tagText: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isTag: false });
  }

  return parts;
}

@Component({
  selector: 'app-hashtag-replacer',
  standalone: true,
  imports: [CommonModule, TopicTagComponent],
  template: `
    @for (part of processedText(); track $index) {
      @if (part.isTag) {
        <app-topic-tag [tId]="part.tagText!.slice(1)">
          <!--          {{ part.tagText }}-->
        </app-topic-tag>
      } @else {
        {{ part.text }}
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HashtagReplacerComponent {

  text = input('Test Hello #Angular and #Ionic™ ! ');

  protected readonly processedText = computed(() => splitIntoHashtagParts(this.text() ?? ''));
}
