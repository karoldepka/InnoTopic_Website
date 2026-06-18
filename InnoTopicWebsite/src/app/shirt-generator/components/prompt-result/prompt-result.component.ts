import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-prompt-result',
  standalone: false,
  templateUrl: './prompt-result.component.html',
  styleUrls: ['./prompt-result.component.scss'],
})
export class PromptResultComponent  implements OnInit {

  @Input() promptResult: string[] = [];
  @Input() isLoading = false;

  isCustomAI =  this.route.snapshot.url.pop()?.path.includes('custom-ai');

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {}

}
