import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';
import { FeatureFlagsService } from '../../shared/feature-flags/feature-flags.service';
import { onThemeStateChange, themeState } from '@innotopic/theme-ui';
import { recolorSvg } from '@innotopic/topics-ui';
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
        [src]="recoloredLogo() ?? resolvedTopic?.logo ?? fallbackLogo"
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
  private readonly themeRevision = signal(0)
  protected readonly recoloredLogo = signal<string | undefined>(undefined)
  private recolorRequestId = 0
  private readonly stopThemeSubscriptions = [
    onThemeStateChange('ion_color_primary', () => this.onThemeChange()),
    onThemeStateChange('ion_color_secondary', () => this.onThemeChange()),
    onThemeStateChange('icon_color_mode', () => this.onThemeChange()),
    onThemeStateChange('icon_contrast', () => this.onThemeChange()),
    onThemeStateChange('icon_brightness', () => this.onThemeChange()),
  ]

  constructor() {
    // Keep the Angular fallback in sync with the Lit component. Leave the original
    // image visible while the shared SVG worker recolors it in the background.
    effect(() => {
      const topic = this.topic();
      const useLit = this.flagsService.useLitTopicComponents();
      const dynamicColorization = this.flagsService.dynamicLogoColorization();
      this.themeRevision();
      const requestId = ++this.recolorRequestId;
      const logoUrl = this.resolveTopic(topic)?.logo;

      if (useLit || !dynamicColorization || !logoUrl || !logoUrl.toLowerCase().endsWith('.svg')) {
        this.recoloredLogo.set(undefined);
        return;
      }

      void recolorSvg(logoUrl, {
        primaryColor: themeState.ion_color_primary,
        colorMode: themeState.icon_color_mode,
        secondaryColor: themeState.ion_color_secondary,
        contrast: themeState.icon_contrast,
        brightness: themeState.icon_brightness,
        primaryContrast: themeState.icon_contrast,
      }).then(markup => {
        if (requestId === this.recolorRequestId) {
          this.recoloredLogo.set(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);
        }
      }).catch(error => {
        if (requestId === this.recolorRequestId) {
          console.error('app-topic-logo: recolor failed', error);
        }
      });
    });
  }

  topic = input.required<Topic | string>();
  size = input(defaultIconHeight);
  /** Only used when the resolved topic has no logoSize - see the Lit component's dimensions logic. */
  width = input<number>();
  height = input<number>();
  margin = input(2);

  get resolvedTopic(): Topic | undefined {
    return this.resolveTopic(this.topic());
  }

  private resolveTopic(topic: Topic | string): Topic | undefined {
    if (typeof topic !== 'string') return topic;
    return this.topicsService.getTopicByIdIfExisting(topic);
  }

  private onThemeChange() {
    this.themeRevision.update(revision => revision + 1);
    this.changeDetector.markForCheck();
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
