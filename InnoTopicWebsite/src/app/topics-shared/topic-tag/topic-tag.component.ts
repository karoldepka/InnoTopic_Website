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
import { Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { FeatureFlagsService } from '../../shared/feature-flags/feature-flags.service';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';
import { onThemeStateChange, themeState } from '@innotopic/theme-ui';
import '@innotopic/topics-ui';
import { TopicLogoComponent } from '../topic-logo/topic-logo.component';

/**
 * Thin wrapper around @innotopic/topics-ui's <topic-tag> custom element (the Lit port of
 * this same component - see that package for the actual lookup/popover/highlight logic).
 * Keeps the original selector/inputs/output so none of its ~16 consuming templates need
 * to change.
 */
@Component({
  selector: 'app-topic-tag',
  standalone: true,
  imports: [TopicLogoComponent],
  template: `
    @if (flagsService.useLitTopicComponents()) {
    <topic-tag
      [tId]="tId()"
      [showLogo]="showLogo()"
      [inline]="inline()"
      [recolorPrimary]="flagsService.dynamicLogoColorization() ? themePrimary : undefined"
      [recolorMode]="themeIconColorMode"
      [recolorSecondary]="themeSecondary"
      [recolorContrast]="themeIconContrast"
      [recolorBrightness]="themeIconBrightness"
      [recolorPrimaryContrast]="themeIconContrast"
      (click-topic)="onClickTopic($event)"
    >
      <ng-content></ng-content>
    </topic-tag>
    } @else {
      <span class="angular-topic-tag" [class.angular-topic-tag--inline]="inline()"
        (click)="onClickTopicLegacy()">
        @if (showLogo() && resolvedTopic?.logo) {
          <app-topic-logo [topic]="resolvedTopic!" [size]="18" [margin]="6" />
        }
        {{ resolvedTopic?.name ?? tId() }}
        <ng-content></ng-content>
      </span>
    }
  `,
  styles: [`
    .angular-topic-tag {
      display: inline-flex;
      align-items: center;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      vertical-align: middle;
    }

    .angular-topic-tag--inline {
      display: inline-flex;
      align-items: center;
    }

    .angular-topic-tag img {
      margin-right: 6px;
      vertical-align: middle;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopicTagComponent implements OnDestroy {
  protected readonly flagsService = inject(FeatureFlagsService)
  private readonly topicsService = inject(TopicsService)
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
  /** Aligns the plain tag with surrounding text; use app-chip for a neumorphic surface. */
  inline = input(false)

  clickTopic = output<Topic | undefined>()

  private cachedTopicId?: string;
  private cachedTopic?: Topic;

  get resolvedTopic(): Topic | undefined {
    const topicId = this.tId().replace('#', '').replace(/_/g, ' ');
    if (topicId !== this.cachedTopicId) {
      this.cachedTopicId = topicId;
      this.cachedTopic = this.topicsService.getTopicByIdIfExisting(topicId);
    }
    return this.cachedTopic;
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

  onClickTopic(event: Event) {
    this.clickTopic.emit((event as CustomEvent<Topic | undefined>).detail)
  }

  onClickTopicLegacy() {
    this.clickTopic.emit(this.resolvedTopic)
  }
}
