import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import '@innotopic/theme-ui';

/**
 * Thin wrapper around @innotopic/theme-ui's <theme-selector> custom element - the preset
 * grid/active-preset/apply logic all lives there now (see the "retire NgRx" decision), this
 * page just supplies its own header chrome.
 */
@Component({
  selector: 'app-theme-list',
  standalone: true,
  imports: [IonicModule, RouterLink],
  templateUrl: './theme-list.page.html',
  styleUrls: ['./theme-list.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ThemeListPage {
}
