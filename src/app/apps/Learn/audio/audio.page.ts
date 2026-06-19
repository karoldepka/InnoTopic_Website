import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-audio',
  templateUrl: './audio.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./audio.page.scss'],
})
export class AudioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
