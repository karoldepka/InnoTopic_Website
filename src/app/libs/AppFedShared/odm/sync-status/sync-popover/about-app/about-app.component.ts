import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-about-app',
    templateUrl: './about-app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./about-app.component.scss'],
})
export class AboutAppComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
