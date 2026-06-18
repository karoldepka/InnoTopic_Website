import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-cv',
  templateUrl: './cv.page.html',
  styleUrls: ['./cv.page.scss'],
})
export class CvPage implements OnInit {

  showThemeConfig = false;

  constructor() { }

  ngOnInit() {
  }

}
