import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TopicTagComponent } from '../../../topics-shared/topic-tag/topic-tag.component';
import { ragStackLayers, ragStackWaterlineAfterLayer } from './rag-stack.data';

@Component({
  selector: 'app-rag-stack',
  standalone: true,
  imports: [CommonModule, IonicModule, TopicTagComponent],
  templateUrl: './rag-stack.component.html',
  styleUrls: ['./rag-stack.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RagStackComponent {
  protected readonly layers = ragStackLayers
  protected readonly waterlineAfterLayer = ragStackWaterlineAfterLayer
}
