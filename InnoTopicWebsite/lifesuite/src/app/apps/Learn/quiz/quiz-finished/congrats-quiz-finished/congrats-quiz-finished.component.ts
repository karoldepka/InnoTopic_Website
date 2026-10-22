import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

const titles = ['Congratulations!', 'Well done!', 'All caught up!', 'Brilliant work!', 'You did it!']

@Component({
    selector: 'app-congrats-quiz-finished',
    templateUrl: './congrats-quiz-finished.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./congrats-quiz-finished.component.sass'],
    imports: [IonicModule],
})
export class CongratsQuizFinishedComponent {

  readonly title = titles[Math.floor(Math.random() * titles.length)]

}
