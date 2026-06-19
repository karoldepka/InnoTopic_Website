import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Recipe} from "../Recipe";

@Component({
  standalone: false,
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./recipe-item.component.sass'],
})
export class RecipeItemComponent implements OnInit {

  @Input() item ! : Recipe

  constructor() { }

  ngOnInit() {}

}
