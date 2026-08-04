/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, NgZone } from '@angular/core';

import { ProxyCmp } from './angular-component-lib/utils';

import type { Components } from '@innotopic/theme-ui/components';

import { defineCustomElement as defineThemeConfigurator } from '@innotopic/theme-ui/components/theme-configurator.js';
import { defineCustomElement as defineThemeSelector } from '@innotopic/theme-ui/components/theme-selector.js';
@ProxyCmp({
  defineCustomElementFn: defineThemeConfigurator
})
@Component({
  selector: 'theme-configurator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class ThemeConfigurator {
  protected el: HTMLThemeConfiguratorElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface ThemeConfigurator extends Components.ThemeConfigurator {}


@ProxyCmp({
  defineCustomElementFn: defineThemeSelector
})
@Component({
  selector: 'theme-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  outputs: ['themeConfigChange'],
})
export class ThemeSelector {
  protected el: HTMLThemeSelectorElement;
  @Output() themeConfigChange = new EventEmitter<ThemeSelectorCustomEvent<IThemeSelectorThemeConfigState>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { ThemeSelectorCustomEvent } from '@innotopic/theme-ui/components';
import type { ThemeConfigState as IThemeSelectorThemeConfigState } from '@innotopic/theme-ui/components';

export declare interface ThemeSelector extends Components.ThemeSelector {
  /**
   * Fires the full resulting config whenever a preset is picked - applyThemeConfig() (via
setThemeConfig() below, through the store's own onChange->scheduleApply wiring) already
re-themes the page as a side effect regardless of whether anyone listens to this; it exists
so a host app can react too (e.g. persist the choice in its own settings model).
   */
  themeConfigChange: EventEmitter<ThemeSelectorCustomEvent<IThemeSelectorThemeConfigState>>;
}


