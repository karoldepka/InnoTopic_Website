import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-search-toolbar',
    templateUrl: './search-toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./search-toolbar.component.sass'],
    imports: [IonicModule],
})
export class SearchToolbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
