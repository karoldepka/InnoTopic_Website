import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import { Topic } from '@innotopic/topics-ui';
import { onThemeStateChange, themeState } from '@innotopic/theme-ui';
import '@innotopic/topics-ui';

/**
 * Thin wrapper around @innotopic/topics-ui's <topic-tag> custom element (the Lit port of
 * this same component - see that package for the actual lookup/popover/highlight logic).
 * Keeps the original selector/inputs/output so none of its ~16 consuming templates need
 * to change.
 */
@Component({
  selector: 'app-topic-tag',
  standalone: true,
  template: `
    <topic-tag
      [tId]="tId()"
      [showLogo]="showLogo()"
      [inline]="inline()"
      [recolorPrimary]="themePrimary"
      [recolorMode]="themeIconColorMode"
      [recolorSecondary]="themeSecondary"
      [recolorContrast]="themeIconContrast"
      [recolorBrightness]="themeIconBrightness"
      [recolorPrimaryContrast]="themeIconContrast"
      (click-topic)="onClickTopic($event)"
    >
      <ng-content></ng-content>
    </topic-tag>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopicTagComponent implements OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef)
  private readonly stopThemeSubscriptions = [
    onThemeStateChange('ion_color_primary', () => this.changeDetector.markForCheck()),
    onThemeStateChange('ion_color_secondary', () => this.changeDetector.markForCheck()),
    onThemeStateChange('icon_color_mode', () => this.changeDetector.markForCheck()),
    onThemeStateChange('icon_contrast', () => this.changeDetector.markForCheck()),
    onThemeStateChange('icon_brightness', () => this.changeDetector.markForCheck()),
  ]

  tId = input.required<string>()
  showLogo = input(true)
  /** Drops the fixed pill font-size/padding so the tag blends into surrounding running text instead of standing out as a discrete tag. */
  inline = input(false)

  clickTopic = output<Topic | undefined>()

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

  onClickTopic(event: Event) {
    this.clickTopic.emit((event as CustomEvent<Topic | undefined>).detail)
  }
}
