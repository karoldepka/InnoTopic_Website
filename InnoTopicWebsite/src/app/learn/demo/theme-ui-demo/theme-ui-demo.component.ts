import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import '@innotopic/gradient-shadow-ui';
import '@innotopic/plasma-ui';

/**
 * A little demo page for @innotopic/theme-ui's Stencil custom elements, used directly (not
 * through the Angular app-theme-config/app-theme-samples wrapper components), so you can see
 * the package working entirely on its own - <theme-selector>'s presets (including the
 * Neumorphism/Neubrutalism ones) and <theme-configurator>'s freeform color/shadow/corner
 * controls, both driving the same @innotopic/theme-ui store in realtime.
 *
 * Also demos two other standalone Lit packages here, since they're visual and this page is
 * otherwise the natural home for "little effects that read theme tokens or just look cool":
 * - @innotopic/gradient-shadow-ui's <gradient-shadow>, whose shadow gradient tracks (and
 *   animates with) --ion-color-primary/--ion-color-secondary as the theme changes.
 * - @innotopic/plasma-ui's <animated-plasma>, a WebGL demoscene-style effect (not theme-token
 *   driven - it's just a fun decorative background, sized via its wrapper's CSS).
 *
 * Custom elements are already registered app-wide by app.module.ts's defineCustomElements(window)
 * call, so this page just uses the theme-ui tags directly; the two Lit packages are imported
 * here directly since Lit self-registers on import, unlike Stencil.
 */
@Component({
  selector: 'app-theme-ui-demo',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './theme-ui-demo.component.html',
  styleUrls: ['./theme-ui-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ThemeUiDemoComponent {
}
