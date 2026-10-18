import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';
import { FeatureFlagsService } from '../../shared/feature-flags/feature-flags.service';
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
    @if (flagsService.useLitTopicComponents()) {
    <topic-logo
      [topic]="topic()"
      [size]="size()"
      [width]="width()"
      [height]="height()"
      [margin]="margin()"
      [recolorPrimary]="flagsService.dynamicLogoColorization() ? themePrimary : undefined"
      [recolorMode]="themeIconColorMode"
      [recolorSecondary]="themeSecondary"
      [recolorContrast]="themeIconContrast"
      [recolorBrightness]="themeIconBrightness"
      [recolorPrimaryContrast]="themeIconContrast"
    ></topic-logo>
    } @else {
      <img
        [src]="resolvedTopic?.logo ?? fallbackLogo"
        [alt]="resolvedTopic?.name ?? ''"
        [style.height.px]="logoHeight"
        [style.margin-right.px]="margin()"
        style="vertical-align: middle"
        loading="lazy"
        decoding="async"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopicLogoComponent implements OnDestroy {
  protected readonly flagsService = inject(FeatureFlagsService)
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

  get resolvedTopic(): Topic | undefined {
    const topic = this.topic();
    if (typeof topic !== 'string') return topic;
    return this.topicsService.getTopicByIdIfExisting(topic);
  }

  get logoHeight(): number {
    const size = this.size();
    const dimensions = this.resolvedTopic?.logoSize;
    if (!dimensions) return this.height() ?? size;
    const [width, height] = dimensions;
    return height > width ? size * height / width : size;
  }

  private readonly topicsService = inject(TopicsService);

  get fallbackLogo(): string {
    const topic = this.topic();
    return typeof topic === 'string' ? topic : '';
  }

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
