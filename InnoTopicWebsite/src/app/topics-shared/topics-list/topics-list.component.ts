import {Component, Input, OnInit} from '@angular/core';
import {highlights} from "../../skills/work-experience-highlights-data";

/** TODO unfinished */
@Component({
  selector: 'app-topics-list',
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
