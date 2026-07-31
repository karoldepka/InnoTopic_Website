import {
  Component,
  OnInit,
} from '@angular/core';
import { BooksComponent } from '../books/books.component';
import { ThreeDTextComponent } from '../shared/threed-text/threed-text.component';
import { PrintService } from '../TopicFriendsShared3/topics-core/print.service';
import { WorkExperienceComponent } from '../skills/work-experience.component';
import { WorkProjectsSectionComponent } from '../work-projects/work-projects-section/work-projects-section.component';
import { ExternalProfilesComponent } from './external-profiles/external-profiles.component';
import { GlobeSwitcherComponent } from './globe-switcher/globe-switcher.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { TopicsGraphComponent } from './topics-graph/topics-graph.component';
import { FeatureFlagsPopoverComponent } from '../shared/feature-flags-popover/feature-flags-popover.component';

@Component({
  standalone: true,
  imports: [
    BooksComponent,
    ExternalProfilesComponent,
    FeatureFlagsPopoverComponent,
    GlobeSwitcherComponent,
    PersonalDataComponent,
    TopicsGraphComponent,
    WorkExperienceComponent,
    WorkProjectsSectionComponent,
  ],
  selector: 'app-cv-page',
  templateUrl: './cv-page.component.html',
  styleUrls: ['./cv-page.component.scss'],
})
export class CvPageComponent implements OnInit {

  /**
   * When printing, every @defer'd section below should render eagerly instead of lazily.
   * AppComponent already injects PrintService in its constructor, so this static field is
   * guaranteed correct for the current navigation by the time this component renders.
   */
  protected readonly isPrint = PrintService.isPrint

  constructor() { }

  ngOnInit() {
    // document.title = 'Karol Depka Pradzinski - InnoTopic.com'
    // document.title = 'Karol Depka Pradzinski - React, Python, Rust, AWS'
    document.title = 'Karol Depka Pradzinski - Kotlin, Java, Kafka, TypeScript, Frontend, Vue.js'
  }

}
