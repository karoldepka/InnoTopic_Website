import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../../../../environments/environment'
import { TranslatePipe } from '@ngx-translate/core';
import {DatePipe, NgFor} from '@angular/common';

@Component({
    selector: 'app-about-app',
    templateUrl: './about-app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./about-app.component.scss'],
    imports: [TranslatePipe, NgFor, DatePipe],
})
export class AboutAppComponent implements OnInit {
  readonly buildInfo = environment.buildInfo

  constructor() { }

  ngOnInit() {}

}
