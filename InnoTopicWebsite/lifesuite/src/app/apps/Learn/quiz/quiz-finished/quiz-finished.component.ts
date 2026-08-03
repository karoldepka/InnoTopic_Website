import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CongratsQuizFinishedComponent } from './congrats-quiz-finished/congrats-quiz-finished.component';
import { IonicModule } from '@ionic/angular';
import { ProcessButtonComponent } from '../../shared/process-button/process-button.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-quiz-finished',
    templateUrl: './quiz-finished.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-finished.component.sass'],
    imports: [
        CongratsQuizFinishedComponent,
        IonicModule,
        ProcessButtonComponent,
        RouterLink,
    ],
})
export class QuizFinishedComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
