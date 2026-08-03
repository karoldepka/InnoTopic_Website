import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import '@innotopic/theme-ui';

/**
 * Thin wrapper around @innotopic/theme-ui's <theme-configurator> custom element - the color
 * pickers/shadow sliders/live preview all live there now (see the "retire NgRx" decision).
 */
@Component({
  selector: 'app-theme-config',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './theme-config.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ThemeConfigComponent {
}
