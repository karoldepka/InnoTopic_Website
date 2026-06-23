import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { initialize } from '@ionic/core/components';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {ChromeExtensionService} from './app/apps/Learn/shared/utils/chrome-extension.service'
import 'hammerjs'

// import { inject } from '@vercel/analytics';

// inject();

if (environment.production) {
  enableProdMode();
}

if (ChromeExtensionService.isApplicationRunAsChromeExtension()) {
  const html = document.getElementsByTagName('html');
  html[0].classList.add('chrome-extension');
}

document.documentElement.classList.add('ion-ce');
initialize({mode: 'md'});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

declare global {
  function xyzTestGlobal(): void
}
