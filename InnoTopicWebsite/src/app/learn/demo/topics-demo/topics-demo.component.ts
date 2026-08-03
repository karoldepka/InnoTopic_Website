import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import '@innotopic/topics-ui';

/**
 * A little demo page for @innotopic/topics-ui's Lit custom elements, used directly (not
 * through the Angular app-topic-tag/app-topic-logo wrapper components), so you can see the
 * package working entirely on its own.
 */
@Component({
  selector: 'app-topics-demo',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './topics-demo.component.html',
  styleUrls: ['./topics-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopicsDemoComponent {
  protected readonly logoTopics = [
    'Angular', 'React', 'Vue.js', 'TypeScript', 'Docker', 'Kubernetes', 'Python', 'Rust', 'Node.js',
  ];

  protected readonly tagTopics = [
    'Angular', 'React', 'Docker', 'Kubernetes', 'Python', 'TypeScript', 'Rust', 'Waffle', 'Kinto',
  ];

  protected readonly sentence =
    "Development of #EuroStat's MDT (Multi-Dimensional Tool) - main tool used for all kinds of "
    + 'statistics in the #European_Union. Advanced #Java #Java_Swing UI.';
}
