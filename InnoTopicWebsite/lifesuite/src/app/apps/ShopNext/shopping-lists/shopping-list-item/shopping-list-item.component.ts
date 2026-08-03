import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ShoppingList} from "../ShoppingList";
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-shopping-list-item',
    templateUrl: './shopping-list-item.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./shopping-list-item.component.sass'],
    imports: [IonicModule, RouterLink],
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
