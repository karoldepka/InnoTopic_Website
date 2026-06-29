import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {SharedModule} from "./shared/shared.module";
import {CoreModule} from "./core/core.module";
import {AngularFireStorage, AngularFireStorageModule} from '@angular/fire/compat/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {HttpClientModule} from '@angular/common/http';
import {DbFirestoreModule} from './apps/OrYoL/db-firestore/db-firestore.module'
import { fas } from '@fortawesome/free-solid-svg-icons';
import {StoreModule} from '@ngrx/store'
import {counterReducer} from './apps/Learn/core/quiz/quiz.reducer'
import {EffectsModule} from '@ngrx/effects'
import {QuizEffects} from './apps/Learn/core/quiz/quiz.effects'
import {StoreDevtoolsModule} from '@ngrx/store-devtools'
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment'
import {registerIonIcons} from './register-ion-icons'
import { HttpAgent } from '@ag-ui/client'
import { provideCopilotKit } from '@copilotkit/angular'
import { PRESS_EVENT_PLUGIN_PROVIDER } from './shared/gestures/press-event.plugin'

const copilotQaAgentId = 'lifesuite-qa'

function copilotAgUiUrl(): string {
  return environment.aiBackendUrl
    ? `${environment.aiBackendUrl}/ai-api/copilotkit-agui`
    : '/ai-api/copilotkit-agui'
}

@NgModule({
    declarations: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            mode: 'md',
        }),
        AppRoutingModule,
        SharedModule,
        CoreModule,
        AngularFireStorageModule, BrowserAnimationsModule,
        DbFirestoreModule,
        HttpClientModule /* Only for primeng tree demo */,
        StoreModule.forRoot({ count: counterReducer }),
        StoreDevtoolsModule.instrument({
            maxAge: 125, // Retains last 25 states
            // logOnly: environment.production, // Restrict extension to log-only mode
            // autoPause: true, // Pauses recording actions and state changes when the extension window is not open
        }),
        // EffectsModule.forRoot([QuizEffects]) /* FIXME this is causing LearnDoService to load */,
        // ServiceWorkerModule.register('ngsw-worker.js', swOpts),
    ],
    exports: [
        CoreModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideCopilotKit({
            selfManagedAgents: {
                [copilotQaAgentId]: new HttpAgent({
                    agentId: copilotQaAgentId,
                    description: 'LifeSuite Q&A category generation copilot',
                    url: copilotAgUiUrl(),
                }),
            },
        }),
        PRESS_EVENT_PLUGIN_PROVIDER,
        // { provide: RouteReuseStrategy, useClass: }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    /** https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/upgrading/0.4.0-0.5.0.md#migrate-from-global-icon-library-to-faiconlibrary
     * https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/upgrading/0.5.0-0.6.0.md */
    faIconLibrary: FaIconLibrary,
  ) {
    registerIonIcons()
    faIconLibrary.addIconPacks(fas);
  }

}
