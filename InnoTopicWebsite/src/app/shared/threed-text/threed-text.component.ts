import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, OnInit, NgZone } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ThemeConfigState } from '../../models/theme-config-state.model';
import { config } from '../../config';

@Component({
  selector: 'app-three-d-text',
  imports: [AsyncPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: {
    '[class.three-d-text--enabled]': 'useThreeDSectionHeaders',
    '[class.three-d-text--fallback]': '!useThreeDSectionHeaders',
  },
  styles: [`:host {
    display: block;
    margin: 20px 0 10px;
  }

  :host(.three-d-text--fallback) {
    margin: 25px 0 10px;
  }

  h1.section-title {
    box-sizing: border-box;
    line-height: 1.1;
  }`],
  template: `
    @if (useThreeDSectionHeaders) {
      <threed-text
        [attr.primary-color]="primaryColor$ | async"
        [attr.secondary-color]="secondaryColor$ | async"
        [attr.text]="text"
        [attr.scroll-zoom]="scrollZoom"
        [attr.font-size]="32"
        [attr.depth]="0.1"
        [attr.fov]="19"
        [attr.perspective]="perspective"
        [attr.drag-rotate]="false"
        [attr.rotate-z]="rotateZ"
        [attr.capitalize]="true"
      ></threed-text>
    } @else {
      <h1 class="section-title shiny-effect">{{ text }}</h1>
    }
  `,
})
export class ThreeDTextComponent implements OnInit {
  @Input() text = '';
  @Input() scrollZoom = 'false';
  @Input() rotateZ = '0';
  @Input() perspective = config.useThreeDTextPerspective ? 'true' : 'false';

  useThreeDSectionHeaders = config.useThreeDSectionHeaders;

  primaryColor$: Observable<string>;
  secondaryColor$: Observable<string>;

  constructor(
    store: Store<{ themeConfig: ThemeConfigState }>,
    private ngZone: NgZone,
  ) {
    this.primaryColor$ = store.select(state => state.themeConfig.ion_color_primary);
    this.secondaryColor$ = store.select(state => state.themeConfig.ion_color_secondary);
  }

  ngOnInit() {
    if (!this.useThreeDSectionHeaders) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (!customElements.get('threed-text')) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'assets/dist/threed-text.js';
        document.head.appendChild(script);
      }
    });
  }
}
