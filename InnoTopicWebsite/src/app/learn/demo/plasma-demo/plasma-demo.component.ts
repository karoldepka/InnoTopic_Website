import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import '@innotopic/plasma-ui';

/**
 * A dedicated demo page for @innotopic/plasma-ui's <animated-plasma>, used directly (no Angular
 * wrapper), matching the pattern set by the topics-ui and theme-ui demo pages. Shows a few
 * differently-scaled/sped-up instances side by side since scale/speed are its only two knobs.
 */
@Component({
  selector: 'app-plasma-demo',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './plasma-demo.component.html',
  styleUrls: ['./plasma-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PlasmaDemoComponent {
}
