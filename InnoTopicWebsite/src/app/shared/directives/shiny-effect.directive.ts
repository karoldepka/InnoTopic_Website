import { Directive, HostBinding, Input, booleanAttribute } from '@angular/core';

@Directive({
  selector: '[appShinyEffect]',
  standalone: true
})
export class ShinyEffectDirective {
  @HostBinding('class.shiny-effect')
  @Input({ transform: booleanAttribute }) appShinyEffect = true;

  @HostBinding('class.shiny-effect--sharp')
  @Input({ transform: booleanAttribute }) sharp = false;

  constructor() {}
}
