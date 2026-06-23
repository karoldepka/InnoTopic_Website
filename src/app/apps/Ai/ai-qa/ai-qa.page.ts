import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CopilotKitReactHostComponent } from '../../CopilotKit/copilotkit-compare/copilotkit-react-host.component';

@Component({
  selector: 'app-ai-qa-page',
  templateUrl: './ai-qa.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CopilotKitReactHostComponent],
})
export class AiQaPage {}
