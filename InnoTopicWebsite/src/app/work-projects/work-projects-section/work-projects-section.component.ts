import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagsComponent } from '../../countries/flags/flags.component';
import { HashtagReplacerComponent } from '../../topics-shared/hashtag-replacer/hashtag-replacer.component';
import { WorkProjectComponent } from './work-project/work-project.component';
import { KeyValOrderedPipe } from '../../utils/KeyValueOrderedPipe';
import { WorkOrganisationsAndProjectsData } from '../work-projects-data';

@Component({
  selector: 'app-work-projects-section',
  standalone: true,
  imports: [CommonModule, FlagsComponent, HashtagReplacerComponent, WorkProjectComponent, KeyValOrderedPipe],
  templateUrl: './work-projects-section.component.html',
  styleUrls: ['./work-projects-section.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkProjectsSectionComponent implements OnInit {

  organisationsAndProjects = WorkOrganisationsAndProjectsData.instance

  constructor() { }

  ngOnInit() {
  }

  keyValOrdered(input: any) {
    const retArray: any = []
    for ( const key of Object.keys(input) ) {
      retArray.push({
        key: key,
        value: (input as any)[key],
      })
    }
    return retArray
  }
}
