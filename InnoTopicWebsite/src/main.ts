import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from '@ionic/core/loader';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const runWhenIdle = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout: 1500 });
    return;
  }

  setTimeout(callback, 0);
};

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => runWhenIdle(() => void defineCustomElements(window)))
  .catch(err => console.error(err));
