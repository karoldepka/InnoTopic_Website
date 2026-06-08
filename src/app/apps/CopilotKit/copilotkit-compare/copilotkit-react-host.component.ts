import {
  Component,
} from '@angular/core';

@Component({
  selector: 'app-copilotkit-react-host',
  template: `
    <iframe
      title="React CopilotKit"
      src="assets/copilotkit-react-embed/index.html?v=lifesuite-copilotkit-2"
    ></iframe>
  `,
  styleUrls: ['./copilotkit-react-host.component.scss'],
})
export class CopilotKitReactHostComponent {}
