import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-bow-quiz-page',
    templateUrl: './bow-quiz.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./bow-quiz.page.scss'],
    imports: [IonicModule],
})
export class BowQuizPage {
  readonly embedUrl = `assets/bow-quiz-react-embed/index.html?apiBase=${encodeURIComponent(
    environment.backendUrl ? `${environment.backendUrl}/ai-api` : '/ai-api',
  )}&v=bow-quiz-3`;
}
