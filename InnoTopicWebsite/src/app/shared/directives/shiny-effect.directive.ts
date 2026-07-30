import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appShinyEffect]',
  standalone: true
})
export class ShinyEffectDirective {
  @HostBinding('class.shiny-effect')
  @Input() appShinyEffect: boolean | string = true;

  constructor() {}
}
