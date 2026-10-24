import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkExperienceListComponent } from '../work-experience-list/work-experience-list.component';
import { WorkExperienceByStatus } from '../work-experience';
import { IndentedSectionComponent } from '../../shared/indented-section/indented-section.component';
import { slugify } from '../../shared/anchors/anchors';

/** status: mode / approach / intent(ions) */
@Component({
  selector: 'app-work-experience-by-status-section',
  standalone: true,
  imports: [CommonModule, WorkExperienceListComponent, IndentedSectionComponent],
  templateUrl: './work-experience-by-status-section.component.html',
  styleUrls: ['./work-experience-by-status-section.component.sass']
})
export class WorkExperienceByStatusSectionComponent implements OnInit {

  @Input() experience!: WorkExperienceByStatus

  protected readonly slugify = slugify

  constructor() { }

  ngOnInit() {
  }

}
