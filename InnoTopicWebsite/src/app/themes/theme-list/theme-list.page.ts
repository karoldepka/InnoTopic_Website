import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeConfigState } from '../../models/theme-config-state.model';
import { updateThemeConfig } from '../../store/actions/theme-config-actions';
import {
  ThemePreset,
  themePresets,
} from './theme-presets.data';

@Component({
  selector: 'app-theme-list',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './theme-list.page.html',
  styleUrls: ['./theme-list.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeListPage {

  private readonly store = inject<Store<{ themeConfig: ThemeConfigState }>>(Store)

  protected readonly presets = themePresets

  private readonly currentThemeConfig = toSignal(this.store.select('themeConfig'))

  /** Highlights a preset card as active only when its 3 core colors exactly match the live theme. */
  protected readonly activePresetName = computed(() => {
    const current = this.currentThemeConfig()
    if ( ! current ) {
      return undefined
    }
    return this.presets.find(preset =>
      preset.config.ion_background_color === current.ion_background_color
      && preset.config.ion_color_primary === current.ion_color_primary
      && preset.config.ion_color_secondary === current.ion_color_secondary,
    )?.name
  })

  applyPreset(preset: ThemePreset) {
    this.store.dispatch(updateThemeConfig(preset.config))
  }
}
