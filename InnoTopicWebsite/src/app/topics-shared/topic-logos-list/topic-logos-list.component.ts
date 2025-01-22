import {Component, Input, OnInit} from '@angular/core';
import {TopicId} from "../../cv-page/topics-graph/topics-graph.types";

@Component({
  selector: 'app-topic-logos-list',
  templateUrl: './topic-logos-list.component.html',
  styleUrls: ['./topic-logos-list.component.scss'],
})
export class TopicLogosListComponent  implements OnInit {
  @Input() topicIds!: string[];

  constructor() { }

  ngOnInit() {}

}
