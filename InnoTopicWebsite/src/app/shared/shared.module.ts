import { NgModule } from '@angular/core';
import { CompanyLogoComponent } from './company-logo/company-logo.component';
import { SpacerComponent } from './spacer/spacer.component';
import {CommonModule} from "@angular/common";

@NgModule({
  imports: [
    CommonModule,
    SpacerComponent,
    CompanyLogoComponent,
  ],
  exports: [
    CommonModule,
    SpacerComponent,
    CompanyLogoComponent,
  ],
})
export class SharedModule { }
