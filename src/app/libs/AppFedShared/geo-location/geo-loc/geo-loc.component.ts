import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-geo-loc',
  templateUrl: './geo-loc.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./geo-loc.component.sass'],
})
export class GeoLocComponent implements OnInit {

  @Input() geoLoc ? : any

  constructor() { }

  ngOnInit() {}

}
