import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Side} from '../../core/sidesDefs'

@Component({
  standalone: false,
  selector: 'app-side-label',
  templateUrl: './side-label.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./side-label.component.sass'],
})
export class SideLabelComponent implements OnInit {

  @Input() side ! : Side

  constructor() { }

  ngOnInit() {}

}
