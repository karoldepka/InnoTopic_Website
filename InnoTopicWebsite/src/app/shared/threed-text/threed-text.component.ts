import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { ThemeConfigState } from '../../models/theme-config-state.model';

@Component({
  selector: 'app-threed-text',
  standalone: true,
  imports: [AsyncPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <threed-text
      [attr.primary-color]="primaryColor$ | async"
      [attr.secondary-color]="secondaryColor$ | async"
      [attr.text]="text"
      [attr.scroll-zoom]="scrollZoom"
    ></threed-text>
  `,
})
export class ThreedTextComponent {
  @Input() text = '';
  @Input() scrollZoom = 'false';

  primaryColor$: Observable<string>;
  secondaryColor$: Observable<string>;

  constructor(store: Store<{ themeConfig: ThemeConfigState }>) {
    this.primaryColor$ = store.select(state => state.themeConfig.ion_color_primary);
    this.secondaryColor$ = store.select(state => state.themeConfig.ion_color_secondary);
  }
}
