import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-vercel-ai-sdk-page',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button mode="md" defaultHref="/ai"></ion-back-button>
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Vercel AI SDK</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-text style="display:block;padding:24px;color:var(--ion-color-medium)">
        Vercel AI SDK (@ai-sdk/angular) integration — coming soon.
      </ion-text>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
})
export class VercelAiSdkPage {}
