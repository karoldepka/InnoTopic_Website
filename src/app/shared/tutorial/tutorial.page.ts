import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./tutorial.page.sass'],
})
export class TutorialPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
