import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ThemeService} from './theme.service'
import {BaseComponent} from '../base/base.component'
import {Theme, ThemeId} from './themes.data'



@Component({
  standalone: false,
  selector: 'app-theme-config',
  templateUrl: './theme-config.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./theme-config.component.sass'],
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
}
