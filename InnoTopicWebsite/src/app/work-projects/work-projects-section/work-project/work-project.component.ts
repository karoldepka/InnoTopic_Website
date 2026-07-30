import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  HASHTAG_BODY_CHAR_CLASS,
  HashtagReplacerComponent,
} from '../../../topics-shared/hashtag-replacer/hashtag-replacer.component';
import { WorkExperienceListComponent } from '../../../skills/work-experience-list/work-experience-list.component';

import { faLaptop } from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-work-project',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, HashtagReplacerComponent, WorkExperienceListComponent],
  templateUrl: './work-project.component.html',
  styleUrls: ['./work-project.component.sass']
})
export class WorkProjectComponent implements OnInit {

  faLaptop: IconDefinition = faLaptop

  @Input() project!: any

  @Input() projectTitle!: string

  get projectDescriptionWithTopicTags(): string {
    return this.addTopicHashTags(this.project?.description ?? '')
  }

  constructor() { }

  ngOnInit() {
  }

  private addTopicHashTags(text = ''): string {
    const topicIds = Object.keys(this.project?.topicsById ?? {})
      .filter(topicId => topicId.length > 1)
      .filter(topicId => this.toTopicHashTag(topicId))
      .sort((a, b) => b.length - a.length)

    return topicIds.reduce((processedText, topicId) => {
      const topicHashTag = this.toTopicHashTag(topicId)
      if (!topicHashTag) {
        return processedText
      }

      // Boundary chars must match HASHTAG_BODY_CHAR_CLASS exactly, otherwise a topic name that's a
      // text-prefix of a hyphenated/dotted compound word (e.g. "Gerrit" in "Gerrit-based") would get
      // wrongly tagged, producing a #Gerrit-based hashtag that HashtagReplacerComponent parses as one
      // (non-existent) topic id instead of leaving "Gerrit-based" as plain text.
      const topicPattern = new RegExp(`(^|[^#${HASHTAG_BODY_CHAR_CLASS}])(${this.escapeRegExp(topicId)})(?=$|[^${HASHTAG_BODY_CHAR_CLASS}])`, 'g')
      return processedText.replace(topicPattern, (_match, prefix) => `${prefix}${topicHashTag}`)
    }, text)
  }

  private toTopicHashTag(topicId: string): string | null {
    if (!/^[A-Za-z0-9][A-Za-z0-9 ._+-]*[A-Za-z0-9_+]$/.test(topicId)) {
      return null
    }

    return `#${topicId.replace(/\s+/g, '_')}`
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

}
