import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-geo-loc',
    templateUrl: './geo-loc.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./geo-loc.component.sass'],
    imports: [NgIf],
})
export class GeoLocComponent implements OnInit {

  @Input() geoLoc ? : any

  constructor() { }

  ngOnInit() {}

}
