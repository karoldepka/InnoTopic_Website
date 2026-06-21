import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {FormControl} from '@angular/forms'
import {stripHtml} from '../../../../../libs/AppFedShared/utils/html-utils'
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-quiz-answer-revealer',
    templateUrl: './quiz-answer-revealer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-answer-revealer.component.scss'],
    imports: [IonicModule],
})
export class QuizAnswerRevealerComponent implements OnInit {

  @Input()
  revealCharactersCount = 0

  @Input()
  formControl1 ! : FormControl<string>


  constructor() { }

  ngOnInit() {}

  getValue() {
    return stripHtml(this.formControl1.value)?.trim()?.substring(0, this.revealCharactersCount)
  }

  onClickReveal() {
    this.revealCharactersCount ++
  }
}
