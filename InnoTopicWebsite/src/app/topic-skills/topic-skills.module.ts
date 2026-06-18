import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsSharedModule } from '../skills-shared/skills-shared.module';
import { TopicsSharedModule } from '../topics-shared/topics-shared.module';
import { TopicSkillComponent } from './topic-skill/topic-skill.component';

@NgModule({
  imports: [
    CommonModule,
    TopicsSharedModule,
    SkillsSharedModule,
    TopicSkillComponent,
  ],
  exports: [
    TopicSkillComponent,
    TopicsSharedModule,
    SkillsSharedModule,
  ]
})
export class TopicSkillsModule { }
