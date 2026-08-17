import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { CategoriesComponent } from '../../../shared/categories/categories.component';

@Component({
    selector: 'app-categories-page',
    templateUrl: './categories.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./categories.page.sass'],
    imports: [
        IonicModule,
        SyncStatusIconComponent,
        CategoriesComponent,
    ],
})
export class CategoriesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
