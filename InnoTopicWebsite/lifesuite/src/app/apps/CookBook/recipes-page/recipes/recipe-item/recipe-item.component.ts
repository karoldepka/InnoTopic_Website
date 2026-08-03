import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Recipe} from "../Recipe";
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-recipe-item',
    templateUrl: './recipe-item.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./recipe-item.component.sass'],
    imports: [IonicModule],
})
export class RecipeItemComponent implements OnInit {

  @Input() item ! : Recipe

  constructor() { }

  ngOnInit() {}

}
