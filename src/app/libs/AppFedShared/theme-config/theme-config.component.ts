import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ThemeService} from './theme.service'
import {BaseComponent} from '../base/base.component'
import {Theme, ThemeId} from './themes.data'
import {contrastRatio, colorDistance, shadeColor, MIN_UI_CONTRAST, MIN_COLOR_DISTANCE} from './color-utils'
import { IonicModule } from '@ionic/angular';
import { NgIf, NgFor, NgStyle, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

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
    ],
})
export class ThemeConfigComponent extends BaseComponent implements OnInit {

  Object = Object

  get themes() {
    return this.themeService.themes
  }

  themesVisible = false

  constructor(
    public themeService: ThemeService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  onSliderChange($event: any) {
    this.themeService.setBrightnessPercent(100 - $event.detail.value)
  }

  getThemeId(theme: Theme) {
    return (theme as any as {id: ThemeId}).id
  }

  /** WCAG contrast ratio + perceptual distinctness for a theme, evaluated against the same
   * shaded background ThemeCalculator.updateColors() actually applies at the current brightness -
   * so these numbers track what setting brightnessPercent live via onSliderChange() does, not just
   * a fixed default. Surfaces the same checks theme-contrast.spec.ts enforces at commit time,
   * live in the picker (GH #133), so a marginal theme is visible before it's picked, not just
   * caught later by the test suite. */
  getContrastInfo(theme: Theme): ThemeContrastInfo {
    const background = shadeColor(theme.background || '#101010', this.themeService.brightnessPercent / 75)
    const primaryContrast = contrastRatio(theme.primary, background)
    const secondaryContrast = contrastRatio(theme.secondary, background)
    const distinctness = colorDistance(theme.primary, theme.secondary)
    return {
      primaryContrast,
      secondaryContrast,
      distinctness,
      primaryOk: primaryContrast >= MIN_UI_CONTRAST,
      secondaryOk: secondaryContrast >= MIN_UI_CONTRAST,
      distinctOk: distinctness >= MIN_COLOR_DISTANCE,
    }
  }

  get currentThemeContrastInfo(): ThemeContrastInfo {
    return this.getContrastInfo(this.themeService.theme)
  }
}
