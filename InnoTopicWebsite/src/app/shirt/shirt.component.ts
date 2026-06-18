import { Component, OnInit } from '@angular/core';
import { highlights } from '../skills/work-experience-highlights-data-shirt';

@Component({
  selector: 'app-shirt',
  standalone: false,
  templateUrl: './shirt.component.html',
  styleUrls: ['./shirt.component.sass']
})
export class ShirtComponent implements OnInit {

  highlights = highlights

  constructor() { }

  ngOnInit() {
    document.title = "InnoTopic-Shirt"
  }

}
