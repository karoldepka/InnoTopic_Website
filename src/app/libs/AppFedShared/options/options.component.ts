import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./options.component.sass'],
})
export class OptionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
