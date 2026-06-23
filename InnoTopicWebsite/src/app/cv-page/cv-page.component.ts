import {
  Component,
  OnInit,
} from '@angular/core';
import { BooksComponent } from '../books/books.component';
import { ThreeDTextComponent } from '../shared/threed-text/threed-text.component';
import { WorkExperienceComponent } from '../skills/work-experience.component';
import { WorkProjectsSectionComponent } from '../work-projects/work-projects-section/work-projects-section.component';
import { ExternalProfilesComponent } from './external-profiles/external-profiles.component';
import { GlobeSwitcherComponent } from './globe-switcher/globe-switcher.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { TopicsGraphComponent } from './topics-graph/topics-graph.component';

@Component({
  standalone: true,
  imports: [
    BooksComponent,
    ExternalProfilesComponent,
    GlobeSwitcherComponent,
    PersonalDataComponent,
    ThreeDTextComponent,
    TopicsGraphComponent,
    WorkExperienceComponent,
    WorkProjectsSectionComponent,
  ],
  selector: 'app-cv-page',
  templateUrl: './cv-page.component.html',
  styleUrls: ['./cv-page.component.scss'],
})
export class CvPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // document.title = 'Karol Depka Pradzinski - InnoTopic.com'
    document.title = 'Karol Depka Pradzinski - React, Python, Rust, AWS'
  }

}
