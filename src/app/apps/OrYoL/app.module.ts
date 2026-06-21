import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http'
// import { TestPermissionsAndFiltersComponent } from './experiments/test-permissions-and-filters/test-permissions-and-filters.component'
import { FormsModule } from '@angular/forms';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal.component'
import { DialogService } from './core/dialog.service';
import { CoreModule } from './core/core.module';
import { CommandsOverlayComponent } from './tree-shared/commands-overlay/commands-overlay.component';
import { TestComponentInstanceChangingOnInputValueChangeComponent } from './experiments/test-component-instance-changing-on-input-value-change/test-component-instance-changing-on-input-value-change.component'

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { OryolSharedModule } from './shared/oryol-shared.module'
import { routingModule } from './app.routing';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../../../../OrYoL_OFF/src/environments/environment';

library.add(fas);


@NgModule({
  declarations: [
    // TestPermissionsAndFiltersComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    // MatIconModule,
    CoreModule,
    routingModule,
    OryolSharedModule,
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    // TreeDragDropService,
    DialogService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
