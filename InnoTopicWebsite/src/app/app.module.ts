import {NgModule, provideAppInitializer} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { injectThemeTokens, initThemeConfig } from '@innotopic/theme-ui';
// @innotopic/theme-ui's custom elements (<theme-selector>/<theme-configurator>) are Stencil
// dist-custom-elements output, which - unlike Lit's auto-registering @customElement - never
// self-defines on import; the loader's defineCustomElements() is Stencil's own registration
// step (same pattern this app already uses for @ionic/core/loader in main.ts).
import { defineCustomElements } from '@innotopic/theme-ui/loader';

/**
 * @innotopic/theme-ui's store already loads persisted config from localStorage at creation
 * time (module load) - this just registers the @property/transition tokens, applies the
 * (already-loaded) state to the DOM's CSS vars, and defines the package's custom elements,
 * once at startup. Replaces the old NgRx themeConfig slice + ThemeConfigEffects +
 * APP_INITIALIZER dispatch - see the migration plan's "retire NgRx" decision.
 */
function initializeThemeConfig() {
  injectThemeTokens();
  initThemeConfig();
  defineCustomElements(window);
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    provideAppInitializer(() => initializeThemeConfig()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
