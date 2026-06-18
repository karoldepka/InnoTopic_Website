import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicsSharedModule } from '../topics-shared/topics-shared.module';
import { SkillLevelIconComponent } from './skill-level-icon/skill-level-icon.component';
import { SkillLevelsIconsComponent } from './skill-levels-icons/skill-levels-icons.component';

@NgModule({
  declarations: [
    SkillLevelsIconsComponent,
    SkillLevelIconComponent,
  ],
  imports: [
    CommonModule,
    TopicsSharedModule,
  ],
  exports: [
    SkillLevelsIconsComponent,
    SkillLevelIconComponent,
    TopicsSharedModule,
  ]
})
export class SkillsSharedModule { }
