import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot} from "@angular/router";
import {ShoppingListsService} from "../shopping-lists/shopping-lists.service";

@Component({
  standalone: false,
  selector: 'app-shopping-list-details-page',
  templateUrl: './shopping-list-details-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./shopping-list-details-page.component.sass'],
})
export class ShoppingListDetailsPageComponent implements OnInit {

  routeSnapshot = this.activatedRoute.snapshot;

  constructor(
    private activatedRoute: ActivatedRoute,
    public shoppingListsService: ShoppingListsService,
  ) {

  }

  ngOnInit() {

  }

}
