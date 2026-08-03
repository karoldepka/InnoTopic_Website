import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./slider.component.sass'],
    imports: [IonicModule, ReactiveFormsModule],
})
export class SliderComponent implements OnInit {

  @Input() minLabel ! : string

  @Input() maxLabel ! : string

  @Input() minVal ! : number

  @Input() maxVal ! : number

  @Input() step : number = 1

  @Input() fractionDigits : number = 2

  @Input() scale : number = 1

  @Input() control ! : UntypedFormControl


  constructor() { }

  ngOnInit() {}

}
