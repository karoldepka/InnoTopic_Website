import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkProjectsSectionComponent } from './work-projects-section/work-projects-section.component';
import { WorkProjectComponent } from './work-projects-section/work-project/work-project.component';

@NgModule({
  imports: [
    CommonModule,
    WorkProjectsSectionComponent,
    WorkProjectComponent,
  ],
  exports: [
    WorkProjectsSectionComponent,
    WorkProjectComponent,
  ]
})
export class WorkProjectsModule { }
