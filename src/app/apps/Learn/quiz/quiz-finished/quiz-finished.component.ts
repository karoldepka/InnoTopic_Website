import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-quiz-finished',
  templateUrl: './quiz-finished.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./quiz-finished.component.sass'],
})
export class QuizFinishedComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
