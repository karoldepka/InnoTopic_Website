import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicTagComponent } from '../topic-tag/topic-tag.component';
import {highlights} from "../../skills/work-experience-highlights-data-shirt";

/** TODO unfinished */
@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [CommonModule, TopicTagComponent],
  templateUrl: './topics-list.component.html',
  styleUrls: ['./topics-list.component.scss'],
})
export class TopicsListComponent {

  @Input() public topics: any[] = [];

  @Input() public iconSize!: number

  @Input() public gap!: number


  constructor() { }


  protected readonly highlights = highlights;
}
