import { NgModule } from '@angular/core';
import { CompanyLogoComponent } from './company-logo/company-logo.component';
import { SpacerComponent } from './spacer/spacer.component';
import {CommonModule} from "@angular/common";
import { ShinyEffectDirective } from './directives/shiny-effect.directive';

@NgModule({
  imports: [
    CommonModule,
    SpacerComponent,
    CompanyLogoComponent,
    ShinyEffectDirective,
  ],
  exports: [
    CommonModule,
    SpacerComponent,
    CompanyLogoComponent,
    ShinyEffectDirective,
  ],
})
export class SharedModule { }
