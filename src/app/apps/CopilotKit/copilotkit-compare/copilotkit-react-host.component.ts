import {
  Component,
} from '@angular/core';

@Component({
  selector: 'app-copilotkit-react-host',
  template: `
    <iframe
      title="React Category Builder"
      src="assets/copilotkit-react-embed/index.html?v=lifesuite-category-builder-4"
    ></iframe>
  `,
  styleUrls: ['./copilotkit-react-host.component.scss'],
})
export class CopilotKitReactHostComponent {}
