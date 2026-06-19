import {Component, ContentChild, OnInit, TemplateRef, ChangeDetectionStrategy} from '@angular/core';
import {ShoppingListsService} from "../shopping-lists.service";
import {debugLog} from "../../../../libs/AppFedShared/utils/log";

@Component({
  standalone: false,
  selector: 'app-shopping-lists-list',
  templateUrl: './shopping-lists-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./shopping-lists-list.component.sass'],
})
export class ShoppingListsListComponent implements OnInit {


  constructor(
    public shoppingListsService: ShoppingListsService,
  ) {
    debugLog('shoppingListsService', this.shoppingListsService)
  }

  ngOnInit() {}

}
