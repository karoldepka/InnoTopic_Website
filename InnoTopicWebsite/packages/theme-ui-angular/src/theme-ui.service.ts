import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  defaultThemeConfig,
  initThemeConfig,
  onThemeStateChange,
  setThemeConfig as engineSetThemeConfig,
  themeState,
  themePresets,
  eligiblePresets,
  findActivePreset,
  applyPreset as engineApplyPreset,
  applyRandomTheme as engineApplyRandomTheme,
  applyNextTheme as engineApplyNextTheme,
} from '@innotopic/theme-ui';
import type { ThemeConfigState, ThemePreset, ThemeCyclingOptions } from '@innotopic/theme-ui';

/**
 * Angular-idiomatic singleton wrapper around theme-ui's plain (framework-agnostic) engine - the
 * canonical way for both InnoTopicWebsite and LifeSuite to read/react to/change the shared theme
 * from a component or another service, without touching custom elements or the plain engine
 * module directly. Ports LifeSuite's old per-app ThemeService (theme-config/theme.service.ts) onto
 * this shared engine, so both apps now have the same curated preset list, brightness slider, and
 * random/next cycling behind one API - see theme-presets.ts/curated-themes.ts/theme-cycling.ts.
 *
 * CAVEAT: this service's store import resolves to theme-ui's main `dist` build. The generated
 * <theme-selector>/<theme-configurator> Angular wrappers in this same package (directives/
 * proxies.ts) call defineCustomElement from the separate `dist-custom-elements` build instead - a
 * different Stencil/Rollup output with its own bundled copy of engine/theme-store.ts, i.e. a
 * different module-level `state` singleton at runtime. A consumer that mixes this service with
 * those generated wrapper components will find picks made through the wrapper don't show up here
 * (found and worked around this exact way while first wiring LifeSuite up - see git history).
 * Consumers embedding a Stencil-authored picker UI should instead use the framework-agnostic
 * custom elements directly (`@innotopic/theme-ui/loader`'s defineCustomElements(), the same `dist`
 * output target this service uses - see InnoTopicWebsite's app.module.ts) rather than this
 * package's generated wrappers, or - like LifeSuite's own theme-config.component.ts - build a
 * native Angular UI against this service directly.
 */
@Injectable({ providedIn: 'root' })
export class ThemeUiService implements OnDestroy {
  private readonly changeSubject = new Subject<ThemeConfigState>();

  /** Emits the full config on every change (not just the one field that changed) - theme-ui's own
   * applyThemeConfig(), which the store already calls internally, always needs the complete state
   * anyway, so a partial emission here would just invite consumers to apply it directly and lose
   * whatever fields didn't change. */
  readonly themeConfigChange$: Observable<ThemeConfigState> = this.changeSubject.asObservable();

  private readonly unsubscribes: Array<() => void> = [];

  constructor(private readonly zone: NgZone) {
    initThemeConfig();
    // theme-ui's store fires onChange once per changed field, synchronously - the same reason
    // theme-store.ts's own scheduleApply() batches via queueMicrotask rather than reacting to
    // each field individually. Mirrored here: without it, picking a whole preset (13 fields)
    // would emit 13 times, each with a partially-applied config, to every subscriber.
    let emitScheduled = false;
    (Object.keys(defaultThemeConfig) as (keyof ThemeConfigState)[]).forEach(key => {
      this.unsubscribes.push(
        onThemeStateChange(key, () => {
          if (emitScheduled) return;
          emitScheduled = true;
          queueMicrotask(() => {
            emitScheduled = false;
            // outside Angular's zone - zone.run() so subscribers' change detection picks it up.
            this.zone.run(() => this.changeSubject.next(this.currentThemeConfig));
          });
        }),
      );
    });
  }

  get currentThemeConfig(): ThemeConfigState {
    return { ...themeState };
  }

  get brightnessPercent(): number {
    return themeState.brightness_percent;
  }

  get fontSizePercent(): number {
    return themeState.font_size_percent;
  }

  /** The preset matching the current live colors, if any - a freeform edit (e.g. via
   * theme-configurator) won't match one, which is expected (undefined). */
  get activePreset(): ThemePreset | undefined {
    return findActivePreset();
  }

  /** Full merged preset list (hand-authored + LifeSuite's ported curated set) minus disabled ones,
   * gated by options.includeExperimental same as LifeSuite's old environment.showExperimentalThemes
   * check - pass that flag through from the consuming app's own environment config rather than
   * this package assuming a default. */
  themes(options?: ThemeCyclingOptions): ThemePreset[] {
    return eligiblePresets(options);
  }

  /** All presets, including disabled ones - rarely what a picker UI wants (see themes() above);
   * exposed for completeness/debugging. */
  get allThemes(): ThemePreset[] {
    return themePresets;
  }

  setThemeConfig(patch: Partial<ThemeConfigState>): void {
    engineSetThemeConfig(patch);
  }

  setBrightnessPercent(brightnessPercent: number): void {
    engineSetThemeConfig({ brightness_percent: brightnessPercent });
  }

  setFontSizePercent(fontSizePercent: number): void {
    engineSetThemeConfig({ font_size_percent: fontSizePercent });
  }

  /** Applies a preset's colors/shadow/corners/icon while preserving the current brightness slider
   * setting - see theme-cycling.ts's applyPreset() for why. */
  setPreset(preset: ThemePreset): void {
    engineApplyPreset(preset);
  }

  applyRandomTheme(options?: ThemeCyclingOptions): void {
    engineApplyRandomTheme(options);
  }

  applyNextTheme(options?: ThemeCyclingOptions): void {
    engineApplyNextTheme(options);
  }

  ngOnDestroy(): void {
    this.unsubscribes.forEach(off => off());
    this.unsubscribes.length = 0;
  }
}
