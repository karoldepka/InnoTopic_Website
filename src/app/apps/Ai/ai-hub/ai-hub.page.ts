import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ai-hub-page',
  templateUrl: './ai-hub.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, RouterLink],
})
export class AiHubPage {}
