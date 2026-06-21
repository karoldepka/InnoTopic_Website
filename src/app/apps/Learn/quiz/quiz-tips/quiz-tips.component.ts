import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-quiz-tips',
    templateUrl: './quiz-tips.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-tips.component.sass'],
})
export class QuizTipsComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
