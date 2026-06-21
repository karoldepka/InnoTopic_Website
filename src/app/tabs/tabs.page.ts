import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['tabs.page.scss'],
    imports: [IonicModule]
})
export class TabsPage {}
