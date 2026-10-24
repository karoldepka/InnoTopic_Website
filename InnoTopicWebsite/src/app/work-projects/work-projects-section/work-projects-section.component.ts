import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagsComponent } from '../../countries/flags/flags.component';
import { HashtagReplacerComponent } from '../../topics-shared/hashtag-replacer/hashtag-replacer.component';
import { WorkProjectComponent } from './work-project/work-project.component';
import { WorkOrganisationsAndProjectsData } from '../work-projects-data';
import { ThreeDTextComponent } from '../../shared/threed-text/threed-text.component';
import { IndentedSectionComponent } from '../../shared/indented-section/indented-section.component';
import { AnchorDirective, slugify } from '../../shared/anchors/anchors';

@Component({
  selector: 'app-work-projects-section',
  standalone: true,
  imports: [CommonModule, FlagsComponent, HashtagReplacerComponent, WorkProjectComponent, ThreeDTextComponent, IndentedSectionComponent, AnchorDirective],
  templateUrl: './work-projects-section.component.html',
  styleUrls: ['./work-projects-section.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkProjectsSectionComponent implements OnInit {

  organisationsAndProjects = WorkOrganisationsAndProjectsData.instance

  constructor() { }

  ngOnInit() {
  }

  protected readonly slugify = slugify

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
