import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ShoppingList} from "../ShoppingList";

@Component({
  standalone: false,
  selector: 'app-shopping-list-item',
  templateUrl: './shopping-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./shopping-list-item.component.sass'],
})
export class ShoppingListItemComponent implements OnInit {

  @Input() item ! : ShoppingList
  shoppingList = this.item

  get routerLink() {
    return `list/${this.item.id}`
  }

  constructor() { }

  ngOnInit() {}

}
