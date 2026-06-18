import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-cv-page',
  templateUrl: './cv-page.component.html',
  styleUrls: ['./cv-page.component.scss'],
})
export class CvPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // document.title = 'Karol Depka Pradzinski - InnoTopic.com'
    document.title = 'Karol Depka Pradzinski - React, Python, Rust, AWS'
  }

}
