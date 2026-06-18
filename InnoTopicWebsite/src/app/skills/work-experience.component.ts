import {
  Component,
  OnInit,
} from '@angular/core';
import { getDictionaryValuesAsArray } from '../utils/dictionary-utils';
import {
  workExperience
} from './work-experience-data';
import { highlights } from './work-experience-highlights-data';
import {UserSkillLevelEnum} from "../TopicFriendsShared3/skills/skills-core/user-skills";
import { CommonModule } from '@angular/common';
import { FlagsComponent } from '../countries/flags/flags.component';
import { TopicLogoComponent } from '../topics-shared/topic-logo/topic-logo.component';
import { SkillLevelIconComponent } from '../skills-shared/skill-level-icon/skill-level-icon.component';
import { TopicSkillComponent } from '../topic-skills/topic-skill/topic-skill.component';
import { WorkExperienceByStatusSectionComponent } from './work-experience-by-status-section/work-experience-by-status-section.component';
import { LanguageSectionComponent } from './language-section/language-section.component';

@Component({
  selector: 'app-work-experience',
  standalone: true,
  imports: [
    CommonModule,
    FlagsComponent,
    TopicLogoComponent,
    SkillLevelIconComponent,
    TopicSkillComponent,
    WorkExperienceByStatusSectionComponent,
    LanguageSectionComponent,
  ],
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.sass']
})
export class WorkExperienceComponent implements OnInit {

  highlights = highlights

  experience = workExperience
  experiencesByStatusArray: any

  skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as UserSkillLevelEnum[]

  constructor() { }

  ngOnInit() {
    this.experiencesByStatusArray = getDictionaryValuesAsArray(this.experience as any)
  }

}
