import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HashtagReplacerComponent } from '../../../topics-shared/hashtag-replacer/hashtag-replacer.component';
import { WorkExperienceListComponent } from '../../../skills/work-experience-list/work-experience-list.component';
import { WorkExperienceModule } from '../../../skills/work-experience.module';

import { faLaptop } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-work-project',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, HashtagReplacerComponent, WorkExperienceModule, WorkExperienceListComponent],
  templateUrl: './work-project.component.html',
  styleUrls: ['./work-project.component.sass']
})
export class WorkProjectComponent implements OnInit {

  faLaptop = faLaptop

  @Input() project!: any

  @Input() projectTitle!: string

  constructor() { }

  ngOnInit() {
  }

}
