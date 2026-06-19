import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-congrats-quiz-finished',
  templateUrl: './congrats-quiz-finished.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./congrats-quiz-finished.component.sass'],
})
export class CongratsQuizFinishedComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
