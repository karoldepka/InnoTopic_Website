import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hashtag-replacer',
  template: `
    <ng-container *ngFor="let part of processedText">
      <ng-container *ngIf="part.isTag; else normalText">
        <app-topic-tag [tId]="part.tagText?.slice(1)!">
<!--          {{ part.tagText }}-->
        </app-topic-tag>
      </ng-container>
      <ng-template #normalText>{{ part.text }}</ng-template>
    </ng-container>
  `,
})
export class HashtagReplacerComponent {

  @Input() text: string = 'Test Hello #Angular and #Ionic™ ! ';

  get processedText(): { text: string; isTag: boolean; tagText?: string }[] {
    this.text ??= ''
    const parts = [];
    const regex = /#(\w+)/g;
    let match;

    let lastIndex = 0;
    while ((match = regex.exec(this.text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: this.text.slice(lastIndex, match.index), isTag: false });
      }
      parts.push({ text: match[0], isTag: true, tagText: match[0] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < this.text.length) {
      parts.push({ text: this.text.slice(lastIndex), isTag: false });
    }

    return parts;
  }
}
