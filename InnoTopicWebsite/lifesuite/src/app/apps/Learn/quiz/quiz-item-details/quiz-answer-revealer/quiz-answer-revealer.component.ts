import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {FormControl} from '@angular/forms'
import {stripHtml} from '../../../../../libs/AppFedShared/utils/html-utils'
import { IonicModule } from '@ionic/angular';

const LONG_PRESS_MS = 500

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

  private longPressTimer?: ReturnType<typeof setTimeout>
  private longPressTriggered = false

  constructor() { }

  ngOnInit() {}

  getValue() {
    return stripHtml(this.formControl1.value)?.trim()?.substring(0, this.revealCharactersCount)
  }

  onClickReveal() {
    this.revealCharactersCount ++
  }

  /** Long-press reveals the whole field value at once instead of one character per tap (GH #127). */
  onPressStart() {
    this.longPressTriggered = false
    this.longPressTimer = setTimeout(() => {
      this.longPressTriggered = true
      this.revealAll()
    }, LONG_PRESS_MS)
  }

  onPressEnd() {
    clearTimeout(this.longPressTimer)
    if ( ! this.longPressTriggered ) {
      this.onClickReveal()
    }
  }

  private revealAll() {
    this.revealCharactersCount = stripHtml(this.formControl1.value)?.trim()?.length ?? 0
  }
}
