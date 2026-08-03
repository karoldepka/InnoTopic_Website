import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Side} from '../../core/sidesDefs'
import { NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-side-icon',
    templateUrl: './side-icon.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./side-icon.component.sass'],
    imports: [NgIf, IonicModule],
})
export class SideIconComponent implements OnInit {

  @Input() side ! : Side

  constructor() { }

  ngOnInit() {}

}
