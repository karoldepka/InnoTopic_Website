import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { Topic } from '@innotopic/topics-ui';
import { onThemeStateChange, themeState } from '@innotopic/theme-ui';
import '@innotopic/topics-ui';

export const defaultIconHeight = 18

/**
 * Thin wrapper around @innotopic/topics-ui's <topic-logo> custom element (the Lit port of
 * this same component). Keeps the original selector/inputs so none of its consumers need
 * to change; the resolution/sizing/rendering logic now all lives in the Lit component.
 */
@Component({
  selector: 'app-topic-logo',
  standalone: true,
  template: `
    <topic-logo
      [topic]="topic()"
      [size]="size()"
      [width]="width()"
      [height]="height()"
      [margin]="margin()"
      [recolorPrimary]="themePrimary"
      [recolorMode]="themeIconColorMode"
      [recolorSecondary]="themeSecondary"
      [recolorContrast]="themeIconContrast"
      [recolorBrightness]="themeIconBrightness"
      [recolorPrimaryContrast]="themeIconContrast"
    ></topic-logo>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopicLogoComponent implements OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef)
  private readonly stopThemeSubscriptions = [
    onThemeStateChange('ion_color_primary', () => this.changeDetector.markForCheck()),
    onThemeStateChange('ion_color_secondary', () => this.changeDetector.markForCheck()),
    onThemeStateChange('icon_color_mode', () => this.changeDetector.markForCheck()),
    onThemeStateChange('icon_contrast', () => this.changeDetector.markForCheck()),
    onThemeStateChange('icon_brightness', () => this.changeDetector.markForCheck()),
  ]

  topic = input.required<Topic | string>();
  size = input(defaultIconHeight);
  /** Only used when the resolved topic has no logoSize - see the Lit component's dimensions logic. */
  width = input<number>();
  height = input<number>();
  margin = input(2);

  get themePrimary() {
    return themeState.ion_color_primary
  }

  get themeSecondary() {
    return themeState.ion_color_secondary
  }

  get themeIconColorMode() {
    return themeState.icon_color_mode
  }

  get themeIconContrast() {
    return themeState.icon_contrast
  }

  get themeIconBrightness() {
    return themeState.icon_brightness
  }

  ngOnDestroy() {
    this.stopThemeSubscriptions.forEach(unsubscribe => unsubscribe())
  }
}
