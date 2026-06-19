import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Side} from '../../core/sidesDefs'

@Component({
  standalone: false,
  selector: 'app-side-icon',
  templateUrl: './side-icon.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./side-icon.component.sass'],
})
export class SideIconComponent implements OnInit {

  @Input() side ! : Side

  constructor() { }

  ngOnInit() {}

}
