import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Required} from '../../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {UntypedFormControl} from '@angular/forms'
import { SliderComponent } from '../../../shared/slider/slider.component';

@Component({
    selector: 'app-quiz-interval-importance-scaling',
    templateUrl: './quiz-interval-importance-scaling.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-interval-importance-scaling.component.sass'],
    imports: [SliderComponent],
})
export class QuizIntervalImportanceScalingComponent implements OnInit {

  @Input()
  @Required()
  control ! : UntypedFormControl

  constructor() { }

  ngOnInit() {}
}
