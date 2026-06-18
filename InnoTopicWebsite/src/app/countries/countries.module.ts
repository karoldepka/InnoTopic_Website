import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryFlagComponent } from './country-flag/country-flag.component';
import { FlagsComponent } from './flags/flags.component';

@NgModule({
  imports: [
    CommonModule,
    CountryFlagComponent,
    FlagsComponent,
  ],
  exports: [
    CountryFlagComponent,
    FlagsComponent,
  ]
})
export class CountriesModule { }
