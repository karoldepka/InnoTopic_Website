import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { AiQaWorkbenchComponent } from '../../shared/ai-qa-workbench.component';

@Component({
  selector: 'app-vercel-ai-sdk-qa-page',
  templateUrl: './vercel-ai-sdk-qa.page.html',
  styleUrls: ['./vercel-ai-sdk-qa.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, AiQaWorkbenchComponent],
})
export class VercelAiSdkQaPage {}
