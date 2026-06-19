import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Required} from '../../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {UntypedFormControl} from '@angular/forms'

@Component({
  standalone: false,
  selector: 'app-quiz-diligence-level',
  templateUrl: './quiz-diligence-level.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./quiz-diligence-level.component.sass'],
})
export class QuizDiligenceLevelComponent implements OnInit {

  @Input()
  @Required()
  control ! : UntypedFormControl

  constructor() { }

  ngOnInit() {}

}
