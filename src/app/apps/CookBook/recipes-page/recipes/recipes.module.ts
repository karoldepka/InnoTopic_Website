import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RecipeItemComponent} from "./recipe-item/recipe-item.component";
import {IonicModule} from "@ionic/angular";

const exports = [
  RecipeItemComponent,
]

@NgModule({
    exports: exports,
    imports: [
        CommonModule,
        IonicModule,
        ...exports
    ]
})
export class RecipesModule { }
