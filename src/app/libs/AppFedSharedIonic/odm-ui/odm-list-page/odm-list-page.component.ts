import {Component, ContentChild, Input, OnInit, TemplateRef, ChangeDetectionStrategy} from '@angular/core';
import {OdmListItemDirective} from "../odm-list/odm-list-item.directive";
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-odm-list-page',
    templateUrl: './odm-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./odm-list-page.component.sass'],
    imports: [IonicModule],
})
export class OdmListPageComponent implements OnInit {

  @Input() parentItem ! : any

  @Input() creatItemFunc ! : any

  /** https://alligator.io/angular/reusable-components-ngtemplateoutlet/ */
  @ContentChild(OdmListItemDirective, /* TODO: add static flag */ { read: TemplateRef, static: true /* TODO check*/ }) itemTemplate: any

  constructor() { }

  ngOnInit() {}

  onAddItem() {
    this.creatItemFunc().saveNowToDb()
  }
}
