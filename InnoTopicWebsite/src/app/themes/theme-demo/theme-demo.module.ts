import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemeDemoPageRoutingModule } from './theme-demo-routing.module';

import { ThemeDemoPage } from './theme-demo.page';
import {ThemeConfigComponent} from "../theme-config/theme-config.component";
import {ChipComponent} from "../../chip/chip.component";
import {HeaderComponent} from "../../header/header.component";
import {ThemeSamplesComponent} from "../theme-samples/theme-samples.component";
import {TintedSwatchesComponent} from "../tinted-swatches/tinted-swatches.component";
// import {ThemesLibModule} from "themes-lib";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ThemeDemoPageRoutingModule,
    ChipComponent,
    HeaderComponent,
  ],
  exports: [
    ThemeConfigComponent,
    ChipComponent,
  ],
  declarations: [
    ThemeDemoPage,
    ThemeConfigComponent,
    ThemeSamplesComponent,
    TintedSwatchesComponent,
  ]
})
export class ThemeDemoPageModule {}
