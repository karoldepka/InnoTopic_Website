import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemeDemoPageRoutingModule } from './theme-demo-routing.module';

import { ThemeDemoPage } from './theme-demo.page';
import {ThemeConfigComponent} from "../theme-config/theme-config.component";
import {ChipComponent} from "../../chip/chip.component";
import {ThemeSamplesComponent} from "../theme-samples/theme-samples.component";
// import {ThemesLibModule} from "themes-lib";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemeDemoPageRoutingModule,
    ThemeConfigComponent,
    ChipComponent,
  ],
  exports: [
    ThemeConfigComponent,
    ChipComponent,
  ],
  declarations: [
    ThemeDemoPage,
    ThemeSamplesComponent,
  ]
})
export class ThemeDemoPageModule {}
