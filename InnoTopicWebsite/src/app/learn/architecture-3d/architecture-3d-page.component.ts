import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TopicSearchComponent } from '../../topics-shared/topic-search/topic-search.component';
import { Architecture3dId } from './architecture-3d.engine';
import {
  AgenticArchitecture3dComponent,
  ARCHITECTURE_3D_PAGES,
  RagArchitecture3dComponent,
} from './architecture-3d.component';

/** Full-page 3D architecture view (route data `vis`), with the topic search above it. */
@Component({
  selector: 'app-architecture-3d-page',
  standalone: true,
  imports: [IonicModule, TopicSearchComponent, RagArchitecture3dComponent, AgenticArchitecture3dComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button mode="md" defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ page.title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content [scrollY]="false">
      <div class="arch3d-page">
        <app-topic-search />
        @if (vis === 'rag') {
          <app-rag-architecture-3d class="arch3d-page-view" />
        } @else {
          <app-agentic-architecture-3d class="arch3d-page-view" />
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .arch3d-page {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .arch3d-page-view {
      display: block;
      flex: 1;
      min-height: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Architecture3dPageComponent {
  protected readonly vis: Architecture3dId = inject(ActivatedRoute).snapshot.data['vis'] === 'rag' ? 'rag' : 'agentic';
  protected readonly page = ARCHITECTURE_3D_PAGES[this.vis];
}
