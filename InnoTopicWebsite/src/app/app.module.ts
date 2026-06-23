import {inject, NgModule, provideAppInitializer} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {Store, StoreModule} from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ThemeConfigEffects } from './store/effects/theme-config.effects';
import {initialState, themeConfigReducer} from "./store/reducers/theme-config-reducer";
import {updateThemeConfig} from "./store/actions/theme-config-actions";
import {STORE_DEVTOOLS_IMPORTS} from "./store/store-devtools.imports";


function readStoredThemeConfig() {
  const storageVal = localStorage.getItem('theme_config');

  if (!storageVal) {
    return initialState;
  }

  try {
    return JSON.parse(storageVal);
  } catch {
    localStorage.removeItem('theme_config');
    return initialState;
  }
}

export function initializeThemeConfig(store: Store) {
  store.dispatch(updateThemeConfig(readStoredThemeConfig()));
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    StoreModule.forRoot({themeConfig: themeConfigReducer}),
    EffectsModule.forRoot([ThemeConfigEffects]),
    ...STORE_DEVTOOLS_IMPORTS,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    provideAppInitializer(() => initializeThemeConfig(inject(Store))),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
