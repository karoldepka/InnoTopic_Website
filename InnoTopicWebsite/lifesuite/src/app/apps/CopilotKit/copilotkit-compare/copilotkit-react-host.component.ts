import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-copilotkit-react-host',
    template: `
    <iframe
      title="React Category Builder"
      [src]="embedUrl"
    ></iframe>
  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./copilotkit-react-host.component.scss'],
})
export class CopilotKitReactHostComponent {
  readonly embedUrl = `assets/copilotkit-react-embed/index.html?apiBase=${encodeURIComponent(
    environment.aiBackendUrl || '/ai-api',
  )}&v=lifesuite-category-builder-5`;
}
