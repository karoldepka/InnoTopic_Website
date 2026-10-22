import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { isThemeRecolorableLogo, Topic } from '../../TopicFriendsShared3/topics-core/Topic';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';
import { intrinsicLogoSize } from '../../TopicFriendsShared3/topics-core/logo-sizes';
import { FeatureFlagsService } from '../../shared/feature-flags/feature-flags.service';
import { onThemeStateChange, themeState } from '@innotopic/theme-ui';
import { loadSvgText, recolorRaster, recolorSvg, RecolorOptions, svgDataUrl } from '@innotopic/topics-ui';
import { IconsReadyService } from '../icons-ready.service';
import { TopicSearchService } from '../topic-search.service';
import { TopicInfoPopoverComponent, TopicInfoTriggerDirective } from '../topic-info/topic-info';

export const defaultIconHeight = 18

/**
 * A topic's logo. With dynamic colorization on, SVG logos (but not e.g. country flags) are
 * recolored to the current theme by the shared Wasm worker pool; the original image shows until
 * the recolored one is ready, and again while the logo or its topic tag is hovered. A standalone
 * logo also toggles the topic's info blurb on click, like a topic tag.
 */
@Component({
  selector: 'app-topic-logo',
  standalone: true,
  imports: [TopicInfoTriggerDirective, TopicInfoPopoverComponent],
  template: `
    <span
      class="topic-logo"
      [class.topic-logo--recolored]="recoloredLogo()"
      [style.margin-right.px]="margin()"
      [appTopicInfoTrigger]="showInfoOnClick() ? resolvedTopic : undefined"
      #topicInfo="topicInfo"
    >
      <img
        class="topic-logo-original"
        [attr.src]="originalSrc()"
        [alt]="resolvedTopic?.name ?? ''"
        [style.height.px]="logoHeight"
        [style.width.px]="logoWidth"
        loading="eager"
        decoding="async"
        (load)="onIconReady()"
        (error)="onLogoError($event)"
      />
      @if (recoloredLogo(); as recolored) {
        <img
          class="topic-logo-recolored"
          [src]="recolored"
          alt=""
          aria-hidden="true"
          [style.height.px]="logoHeight"
          [style.width.px]="logoWidth"
          decoding="async"
          (load)="onIconReady()"
        />
      }
    </span>
    @if (topicInfo.open()) {
      <app-topic-info-popover [text]="topicInfo.info()!" />
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-block;
      vertical-align: middle;
    }

    .topic-logo {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
    }

    .topic-logo img {
      display: block;
      object-fit: contain;
    }

    /* The recolored copy covers the original. Hovering the logo (or its topic tag) fades the copy
       out to reveal the original colors; the original hides again only once the copy has faded
       back in, so the two never show half-transparent together. */
    .topic-logo-recolored {
      position: absolute;
      top: 0;
      left: 0;
      transition: opacity var(--logo-hover-fade, 250ms) ease-in-out;
    }

    .topic-logo--recolored .topic-logo-original {
      opacity: 0;
      transition: opacity 0s linear var(--logo-hover-fade, 250ms);
    }

    :host(:hover) .topic-logo-original,
    :host-context(app-topic-tag:hover) .topic-logo-original {
      opacity: 1;
      transition-delay: 0s;
    }

    :host(:hover) .topic-logo-recolored,
    :host-context(app-topic-tag:hover) .topic-logo-recolored {
      opacity: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .topic-logo-recolored {
        transition-duration: 0s;
      }

      .topic-logo--recolored .topic-logo-original {
        transition-delay: 0s;
      }
    }

    /* Topic search, same look as app-topic-tag's (see there). */
    :host {
      transition: opacity 0.2s ease, filter 0.2s ease;
    }

    :host(.topic-search--muted) {
      opacity: 0.25;
      filter: grayscale(1);
    }

    :host(.topic-search--match) .topic-logo {
      border-radius: 4px;
      box-shadow:
        0 0 0 2px var(--ion-background-color, #fff),
        0 0 0 4px var(--ion-text-color, #000);
    }
  `],
  host: {
    '[style.--logo-hover-fade]': 'hoverFade()',
    '[class.topic-search--match]': "searchState() === 'match'",
    '[class.topic-search--muted]': "searchState() === 'muted'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicLogoComponent implements OnDestroy {
  private readonly topicSearch = inject(TopicSearchService)
  /** Standalone logos follow the topic search; inside a topic tag the tag shows it for both. */
  protected readonly searchState = computed(() => {
    const state = this.topicSearch.stateOf(this.resolveTopic(this.topic()) ?? this.fallbackLogo)
    return state && !this.host.nativeElement.parentElement?.closest('app-topic-tag') ? state : undefined
  })
  protected readonly flagsService = inject(FeatureFlagsService)
  private readonly changeDetector = inject(ChangeDetectorRef)
  private readonly themeRevision = signal(0)
  protected readonly recoloredLogo = signal<string | undefined>(undefined)
  /** The original-colors image; null while its SVG text is still downloading. */
  protected readonly originalSrc = signal<string | null>(null)
  /** Logo URL whose downloaded SVG text the original image shows (or will show). */
  private originalFromTextOf?: string
  protected readonly hoverFade = computed(() => `${this.flagsService.logoHoverFadeMs()}ms`)
  private recolorRequestId = 0
  private isRecoloringIcon = false
  private finishIconLoad?: () => void
  private readonly iconsReady = inject(IconsReadyService)
  private readonly host = inject(ElementRef<HTMLElement>)
  private readonly stopThemeSubscriptions = [
    onThemeStateChange('ion_color_primary', () => this.onThemeChange()),
    onThemeStateChange('ion_color_secondary', () => this.onThemeChange()),
    onThemeStateChange('icon_color_mode', () => this.onThemeChange()),
    onThemeStateChange('icon_contrast', () => this.onThemeChange()),
    onThemeStateChange('icon_brightness', () => this.onThemeChange()),
  ]

  constructor() {
    // Leave the original image visible while the shared SVG worker recolors it in the background.
    effect(() => {
      const topic = this.topic();
      const dynamicColorization = this.flagsService.dynamicLogoColorization();
      this.themeRevision();
      const requestId = ++this.recolorRequestId;
      this.isRecoloringIcon = false;
      const resolvedTopic = this.resolveTopic(topic);
      const logoUrl = resolvedTopic?.logo;

      this.finishLoading();
      if (!logoUrl) {
        this.recoloredLogo.set(undefined);
        this.showOriginal(this.fallbackLogo || null);
        return;
      }
      this.finishIconLoad = this.iconsReady.beginLoad(`topic-logo:${resolvedTopic?.name ?? logoUrl}`);

      const isSvg = logoUrl.toLowerCase().endsWith('.svg');
      if (!dynamicColorization || !isThemeRecolorableLogo(logoUrl)) {
        this.recoloredLogo.set(undefined);
        this.showOriginal(logoUrl);
        this.finishIfImageAlreadyLoaded();
        return;
      }
      if (isSvg) {
        this.showOriginalFromSvgText(logoUrl);
      } else {
        this.showOriginal(logoUrl);
      }

      this.isRecoloringIcon = true;
      const options: RecolorOptions = {
        primaryColor: themeState.ion_color_primary,
        colorMode: themeState.icon_color_mode,
        secondaryColor: themeState.ion_color_secondary,
        contrast: themeState.icon_contrast,
        brightness: themeState.icon_brightness,
        primaryContrast: themeState.icon_contrast,
      };
      const recoloring = isSvg
        ? recolorSvg(logoUrl, options).then(svgDataUrl)
        : recolorRaster(logoUrl, options);
      void recoloring.then(recolored => {
        if (requestId === this.recolorRequestId) {
          this.isRecoloringIcon = false;
          const unchanged = recolored === this.recoloredLogo();
          this.recoloredLogo.set(recolored);
          // The same image fires no new load event, so it is ready right away.
          if (unchanged) this.onIconReady();
        }
      }).catch(error => {
        if (requestId === this.recolorRequestId) {
          this.isRecoloringIcon = false;
          console.error('app-topic-logo: recolor failed', error);
          this.finishIfImageAlreadyLoaded();
        }
      });
    });
  }

  topic = input.required<Topic | string>();
  size = input(defaultIconHeight);
  /** Not applied: logos are sized by height and keep their aspect ratio. */
  width = input<number>();
  height = input<number>();
  margin = input(2);
  /** Toggle the topic's info blurb on click; off inside a topic tag, which handles the click itself. */
  showInfoOnClick = input(true);

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

  private showOriginal(src: string | null) {
    this.originalFromTextOf = undefined;
    this.originalSrc.set(src);
  }

  /** Shows the original from the SVG text the recolorer downloads anyway, so it is fetched once. */
  private showOriginalFromSvgText(url: string) {
    if (this.originalFromTextOf === url) return;
    this.originalFromTextOf = url;
    this.originalSrc.set(null);
    loadSvgText(url).then(
      text => {
        if (this.originalFromTextOf === url) this.originalSrc.set(svgDataUrl(text));
      },
      // Let the <img> request the file itself, so a missing logo still ends up in onLogoError.
      () => {
        if (this.originalFromTextOf === url) this.originalSrc.set(url);
      },
    );
  }

  onLogoError(event: Event) {
    const image = event.target as HTMLImageElement;
    console.warn('[app-topic-logo] Icon image failed to load', {
      topic: this.resolvedTopic?.name,
      src: image.currentSrc || image.src,
    });
    image.style.display = 'none';
    this.onIconReady();
  }

  onIconReady() {
    if (this.isRecoloringIcon) return;
    this.finishLoading();
  }

  private finishLoading() {
    this.finishIconLoad?.();
    this.finishIconLoad = undefined;
  }

  private finishIfImageAlreadyLoaded() {
    setTimeout(() => {
      const image = this.host.nativeElement.querySelector('img');
      if (!image || image.complete) this.onIconReady();
    });
  }

  get logoHeight(): number {
    const size = this.size();
    const dimensions = this.resolvedTopic?.logoSize;
    if (!dimensions) return this.height() ?? size;
    const [width, height] = dimensions;
    return height > width ? size * height / width : size;
  }

  /** Reserved from the logo's known proportions (logo-sizes.json), so the layout doesn't jump when it loads. */
  get logoWidth(): number | undefined {
    const size = intrinsicLogoSize(this.resolvedTopic?.logo ?? this.fallbackLogo);
    return size && this.logoHeight * size[0] / size[1];
  }

  private readonly topicsService = inject(TopicsService);

  get fallbackLogo(): string {
    const topic = this.topic();
    return typeof topic === 'string' ? topic : '';
  }

  ngOnDestroy() {
    // Even mid-recolor: a destroyed logo must not keep the page's icons from becoming ready.
    this.recolorRequestId++;
    this.finishLoading();
    this.stopThemeSubscriptions.forEach(unsubscribe => unsubscribe())
  }
}
