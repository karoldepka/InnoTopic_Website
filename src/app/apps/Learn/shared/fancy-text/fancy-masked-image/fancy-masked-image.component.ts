import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-fancy-masked-image',
  templateUrl: './fancy-masked-image.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./fancy-masked-image.component.sass'],
})
export class FancyMaskedImageComponent implements OnInit {

  // https://css-tricks.com/how-to-do-knockout-text/
  // https://css-tricks.com/almanac/properties/m/mask-image/
  // https://stackoverflow.com/questions/11924800/use-text-as-a-mask-on-background-image
  // https://codepen.io/YusukeNakaya/pen/xNdvKW -- warning striped
  // https://css-tricks.com/css-techniques-and-effects-for-knockout-text/
  // https://freefrontend.com/css-animated-backgrounds/

  // this component is itself gonna choose from multiple background images randomly
  // (with defaults, overridable)

  constructor() { }

  ngOnInit() {}

}
