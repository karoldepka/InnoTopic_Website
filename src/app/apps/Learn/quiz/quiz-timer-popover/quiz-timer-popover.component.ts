import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-quiz-timer-popover',
  templateUrl: './quiz-timer-popover.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./quiz-timer-popover.component.sass'],
})
export class QuizTimerPopoverComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
