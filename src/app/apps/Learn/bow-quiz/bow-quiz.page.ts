import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-bow-quiz-page',
    templateUrl: './bow-quiz.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./bow-quiz.page.scss'],
    imports: [IonicModule],
})
export class BowQuizPage {}
