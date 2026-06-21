import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-fancy-text',
  templateUrl: './fancy-text.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./fancy-text.component.sass'],
})
export class FancyTextComponent implements OnInit {

  /* TODO: option / input if animated or not -- coz might be annoying/slowdown/battery-drain to user */

  constructor() { }

  ngOnInit() {}

}
