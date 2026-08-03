import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-rating-cell',
    templateUrl: './rating-cell.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./rating-cell.component.sass'],
    imports: [IonicModule],
})
export class RatingCellComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
