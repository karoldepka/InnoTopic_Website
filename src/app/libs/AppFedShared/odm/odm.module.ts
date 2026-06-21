import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SyncStatusIconComponent} from './sync-status/sync-status-icon.component'
import {IonicModule} from '@ionic/angular'
import {SyncPopoverComponent} from './sync-status/sync-popover/sync-popover.component'
import {ThemeConfigComponent} from '../theme-config/theme-config.component'
import {FeatureConfigComponent} from '../feature-config/feature-config.component'
import {AboutAppComponent} from './sync-status/sync-popover/about-app/about-app.component'

@NgModule({
    exports: [
        SyncStatusIconComponent,
        FeatureConfigComponent,
    ],
    imports: [
        CommonModule,
        IonicModule,
        SyncStatusIconComponent,
        SyncPopoverComponent,
        ThemeConfigComponent,
        FeatureConfigComponent,
        AboutAppComponent,
    ]
})
export class OdmModule { }
