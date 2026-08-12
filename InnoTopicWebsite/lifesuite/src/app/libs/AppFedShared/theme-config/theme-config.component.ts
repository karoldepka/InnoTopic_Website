import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../base/base.component'
import {environment} from '../../../../environments/environment'
import { IonicModule } from '@ionic/angular';
import { NgIf, NgFor, NgStyle, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
// Shared with InnoTopicWebsite via packages/theme-ui (pnpm workspace) - ThemeUiService wraps the
// same engine InnoTopicWebsite's own <theme-configurator>/<theme-selector> pages use, now also
// carrying LifeSuite's ported curated theme list/brightness slider/random-next cycling (see
// packages/theme-ui/src/engine/curated-themes.ts and theme-cycling.ts). This component builds its
// own native template against the service (rather than embedding the package's Stencil-authored
// <theme-selector>) so it can keep LifeSuite's existing per-theme contrast-badge list look, which
// that generic component doesn't have.
import {
  ThemeUiService,
  ThemePreset,
  ThemeConfigurator,
  shadeColor,
  contrastRatio,
  colorDistance,
  MIN_UI_CONTRAST,
  MIN_COLOR_DISTANCE,
} from '@innotopic/theme-ui-angular'

export type ThemeContrastInfo = {
  primaryContrast: number
  secondaryContrast: number
  distinctness: number
  primaryOk: boolean
  secondaryOk: boolean
  distinctOk: boolean
}

@Component({
    selector: 'app-theme-config',
    templateUrl: './theme-config.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./theme-config.component.sass'],
    imports: [
        IonicModule,
        NgIf,
        NgFor,
        NgStyle,
        DecimalPipe,
        TranslatePipe,
        ThemeConfigurator,
    ],
})
export class ThemeConfigComponent extends BaseComponent implements OnInit {

  Object = Object

  get themes(): ThemePreset[] {
    return this.themeUiService.themes({ includeExperimental: environment.showExperimentalThemes })
  }

  themesVisible = false

  /** <theme-configurator> (packages/theme-ui's Stencil component, wrapped by theme-ui-angular) -
   * individual color pickers plus shadow/corner-radius sliders, as opposed to this component's
   * own preset-only picker above. Takes no inputs/outputs of its own - it reads/writes theme-ui's
   * shared themeState directly, so dropping it in needs no wiring. Visible by default (unlike
   * themesVisible above) - the whole point of this section is to show the full theme config, not
   * make it a second click away. The toggle button stays so it can still be collapsed. */
  advancedEditorVisible = true

  constructor(
    public themeUiService: ThemeUiService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  onSliderChange($event: any) {
    this.themeUiService.setBrightnessPercent(100 - $event.detail.value)
  }

  pickTheme(preset: ThemePreset) {
    this.themeUiService.setPreset(preset)
  }

  applyRandomTheme() {
    this.themeUiService.applyRandomTheme({ includeExperimental: environment.showExperimentalThemes })
  }

  applyNextTheme() {
    this.themeUiService.applyNextTheme({ includeExperimental: environment.showExperimentalThemes })
  }

  /** WCAG contrast ratio + perceptual distinctness for a primary/secondary/background triplet,
   * evaluated against the same shaded background applyThemeConfig() actually applies at the
   * current brightness - so these numbers track what setting brightnessPercent live via
   * onSliderChange() does, not just a fixed default. Surfaces the same checks
   * theme-contrast.spec.ts enforces at commit time, live in the picker (GH #133), so a marginal
   * theme is visible before it's picked, not just caught later by the test suite. */
  private contrastInfoFor(primary: string, secondary: string, rawBackground: string): ThemeContrastInfo {
    const background = shadeColor(rawBackground, this.themeUiService.brightnessPercent / 75)
    const primaryContrast = contrastRatio(primary, background)
    const secondaryContrast = contrastRatio(secondary, background)
    const distinctness = colorDistance(primary, secondary)
    return {
      primaryContrast,
      secondaryContrast,
      distinctness,
      primaryOk: primaryContrast >= MIN_UI_CONTRAST,
      secondaryOk: secondaryContrast >= MIN_UI_CONTRAST,
      distinctOk: distinctness >= MIN_COLOR_DISTANCE,
    }
  }

  getContrastInfo(preset: ThemePreset): ThemeContrastInfo {
    return this.contrastInfoFor(preset.config.ion_color_primary, preset.config.ion_color_secondary, preset.config.ion_background_color)
  }

  get activePresetName(): string {
    return this.themeUiService.activePreset?.name ?? 'Custom'
  }

  get currentThemeContrastInfo(): ThemeContrastInfo {
    const current = this.themeUiService.currentThemeConfig
    return this.contrastInfoFor(current.ion_color_primary, current.ion_color_secondary, current.ion_background_color)
  }
}
