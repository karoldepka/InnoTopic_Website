import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalInterestsModule } from '../personal-interests/personal-interests.module';
import { WorkExperienceModule } from '../skills/work-experience.module';
import { WorkProjectsModule } from '../work-projects/work-projects.module';
import { CvPageComponent } from './cv-page.component';
import { TechGraphComponent } from './tech-graph/tech-graph.component';
import { Logo3dComponent } from './logo3d/logo3d.component';
import { TechGraphD3Component } from './tech-graph-d3/tech-graph-d3.component';
import { TechGraphD3Index1Component } from './tech-graph-d3-index1/tech-graph-d3-index1.component';
import { VideoCvComponent } from './video-cv/video-cv.component';
import { SharedModule } from '../shared/shared.module';
import { TopicsSharedModule } from '../topics-shared/topics-shared.module';
import { ThreeDTextComponent } from '../shared/threed-text/threed-text.component';
import { TopicsGraphComponent } from './topics-graph/topics-graph.component';
// Standalone components — imported instead of declared
import { WorldMapComponent } from './world-map/world-map.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { ExternalProfilesComponent } from './external-profiles/external-profiles.component';
import { GlobeGlComponent } from './globe-gl/globe-gl.component';
import { GlobeD3Component } from './globe-d3/globe-d3.component';
import { GlobeThreejsComponent } from './globe-threejs/globe-threejs.component';
import { GlobeSwitcherComponent } from './globe-switcher/globe-switcher.component';

@NgModule({
  declarations: [
    CvPageComponent,
    TechGraphComponent,
    Logo3dComponent,
    TechGraphD3Component,
    TechGraphD3Index1Component,
    VideoCvComponent,
  ],
  exports: [
    CvPageComponent,
  ],
  imports: [
    CommonModule,
    WorkExperienceModule,
    WorkProjectsModule,
    PersonalInterestsModule,
    SharedModule,
    TopicsSharedModule,
    ThreeDTextComponent,
    TopicsGraphComponent,
    // Standalone components
    WorldMapComponent,
    PersonalDataComponent,
    ExternalProfilesComponent,
    GlobeGlComponent,
    GlobeD3Component,
    GlobeThreejsComponent,
    GlobeSwitcherComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class CvPageModule1 { }
