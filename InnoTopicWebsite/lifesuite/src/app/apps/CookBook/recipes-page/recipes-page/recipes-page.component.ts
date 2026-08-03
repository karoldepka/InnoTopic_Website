import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {RecipesService} from "../recipes/recipes.service";
import {Recipe} from "../recipes/Recipe";
import { IonicModule } from '@ionic/angular';
import { OdmListPageComponent } from '../../../../libs/AppFedSharedIonic/odm-ui/odm-list-page/odm-list-page.component';
import { OdmListComponent } from '../../../../libs/AppFedSharedIonic/odm-ui/odm-list/odm-list.component';
import { OdmListItemDirective } from '../../../../libs/AppFedSharedIonic/odm-ui/odm-list/odm-list-item.directive';
import { RecipeItemComponent } from '../recipes/recipe-item/recipe-item.component';

@Component({
    selector: 'app-recipes-page',
    templateUrl: './recipes-page.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./recipes-page.component.sass'],
    imports: [
        IonicModule,
        OdmListPageComponent,
        OdmListComponent,
        OdmListItemDirective,
        RecipeItemComponent,
    ],
})
export class RecipesPageComponent implements OnInit {

  createItemFunc = () => {
    const recipe = new Recipe(this.recipesService);
    recipe.title = `[ new Recipe ${new Date()} ]`
    return recipe
  }

  constructor(
    public recipesService: RecipesService,
  ) {

  }

  ngOnInit() {}

}
