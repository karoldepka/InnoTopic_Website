import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ThemeConfigState } from '../../models/theme-config-state.model';

@Component({
  selector: 'app-three-d-text',
  imports: [AsyncPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <threed-text
      [attr.primary-color]="primaryColor$ | async"
      [attr.secondary-color]="secondaryColor$ | async"
      [attr.text]="text"
      [attr.scroll-zoom]="scrollZoom"
      [attr.font-size]="32"
      [attr.depth]="0.1"
      [attr.fov]="19"
      [attr.drag-rotate]="false"
      [attr.rotate-z]="rotateZ"
      [attr.capitalize]="true"
    ></threed-text>
  `,
})
export class ThreeDTextComponent implements OnInit {
  @Input() text = '';
  @Input() scrollZoom = 'false';
  @Input() rotateZ = '0';

  primaryColor$: Observable<string>;
  secondaryColor$: Observable<string>;

  constructor(store: Store<{ themeConfig: ThemeConfigState }>) {
    this.primaryColor$ = store.select(state => state.themeConfig.ion_color_primary);
    this.secondaryColor$ = store.select(state => state.themeConfig.ion_color_secondary);
  }

  ngOnInit() {
    if (!customElements.get('threed-text')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'assets/dist/threed-text.js';
      document.head.appendChild(script);
    }
  }
}
