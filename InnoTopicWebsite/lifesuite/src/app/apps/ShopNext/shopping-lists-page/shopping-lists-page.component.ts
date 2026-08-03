import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {ShoppingListsService} from "../shopping-lists/shopping-lists.service";
import {ShoppingList} from "../shopping-lists/ShoppingList";
import { IonicModule } from '@ionic/angular';
import { ShoppingListsListComponent } from '../shopping-lists/shopping-lists-list/shopping-lists-list.component';

@Component({
    selector: 'app-shopping-lists-page',
    templateUrl: './shopping-lists-page.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./shopping-lists-page.component.sass'],
    imports: [IonicModule, ShoppingListsListComponent],
})
export class ShoppingListsPageComponent implements OnInit {

  constructor(
    public shoppingListsService: ShoppingListsService,
  ) { }

  ngOnInit() {}

  onAddItem() {
    new ShoppingList(this.shoppingListsService, 'New shopping list ' + new Date()).saveNowToDb()
  }
}
