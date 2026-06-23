import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CopilotChat, CopilotKitAgentContext } from '@copilotkit/angular';

import { AiQaWorkbenchComponent } from '../../shared/ai-qa-workbench.component';

const COPILOT_AGENT_ID = 'lifesuite-qa';

@Component({
  selector: 'app-copilotkit-qa-page',
  templateUrl: './copilotkit-qa.page.html',
  styleUrls: ['./copilotkit-qa.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonicModule,
    CopilotChat,
    CopilotKitAgentContext,
    AiQaWorkbenchComponent,
  ],
})
export class CopilotkitQaPage {
  readonly agentId = COPILOT_AGENT_ID;
  readonly agentContext = {
    description: 'Current LifeSuite AI workspace',
    value: [
      'The user is generating learning categories and flashcard question-and-answer pairs.',
      'The structured generation endpoints are /ai-api/category-tree and /ai-api/category-tree/questions.',
      'Prefer concise category refinements and compact answer text.',
    ].join('\n'),
  };
}
