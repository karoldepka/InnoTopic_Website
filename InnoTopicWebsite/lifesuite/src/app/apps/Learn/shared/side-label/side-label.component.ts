import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Side} from '../../core/sidesDefs'
import { IonicModule } from '@ionic/angular';
import { SideIconComponent } from '../side-icon/side-icon.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-side-label',
    templateUrl: './side-label.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./side-label.component.sass'],
    imports: [
        IonicModule,
        SideIconComponent,
        NgIf,
    ],
})
export class SideLabelComponent implements OnInit {

  @Input() side ! : Side

  constructor() { }

  ngOnInit() {}

}
