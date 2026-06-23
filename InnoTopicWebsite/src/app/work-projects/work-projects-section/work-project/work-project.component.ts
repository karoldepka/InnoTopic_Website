import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HashtagReplacerComponent } from '../../../topics-shared/hashtag-replacer/hashtag-replacer.component';
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

  constructor() { }

  ngOnInit() {
  }

}
