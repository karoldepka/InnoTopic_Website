import { Component, Event, EventEmitter, forceUpdate, h } from '@stencil/core'
import { themeState, initThemeConfig, onThemeStateChange } from '../../engine/theme-store'
import { injectThemeTokens } from '../../engine/tokens'
import { themePresets, ThemePreset } from '../../engine/theme-presets'
import { applyPreset, findActivePreset } from '../../engine/theme-cycling'
import type { ThemeConfigState } from '../../engine/theme-config-state'

// disabled presets (known-broken/superseded, e.g. LifeSuite's ported "Black and Dark Brown") are
// never shown here - everything else (including experimental ones) is, since this framework-
// agnostic component has no equivalent of LifeSuite's own environment.showExperimentalThemes
// gate. A consuming app that wants that gating builds its own picker against the plain engine
// exports instead (see LifeSuite's theme-config.component.ts).
const selectablePresets = themePresets.filter(preset => !preset.disabled)

/**
 * Ports Angular's theme-list.page (the preset grid / "theme-selector"). No longer talks to
 * NgRx - reads/writes @innotopic/theme-ui's own store directly, which is now the single
 * source of truth (see the plan's "retire NgRx" decision).
 */
@Component({
  tag: 'theme-selector',
  styleUrl: 'theme-selector.css',
  shadow: true,
})
export class ThemeSelector {
  /** Fires the full resulting config whenever a preset is picked - applyThemeConfig() (via
   * setThemeConfig() below, through the store's own onChange->scheduleApply wiring) already
   * re-themes the page as a side effect regardless of whether anyone listens to this; it exists
   * so a host app can react too (e.g. persist the choice in its own settings model). */
  @Event() themeConfigChange!: EventEmitter<ThemeConfigState>

  private unsubscribes: Array<() => void> = []

  connectedCallback() {
    injectThemeTokens()
    initThemeConfig()
    ;(['ion_color_primary', 'ion_color_secondary', 'ion_background_color'] as const).forEach(key => {
      this.unsubscribes.push(onThemeStateChange(key, () => this.forceRerender()))
    })
  }

  disconnectedCallback() {
    this.unsubscribes.forEach(off => off())
    this.unsubscribes = []
  }

  private forceRerender() {
    // render() reads the plain imported `themeState` object directly, not a @State-decorated
    // field, so Stencil has no way to know it changed on its own - forceUpdate() is Stencil's
    // documented escape hatch for exactly this ("re-render using state that isn't a prop/state").
    forceUpdate(this)
  }

  private get activePresetName(): string | undefined {
    return findActivePreset(selectablePresets)?.name
  }

  private pickPreset(preset: ThemePreset) {
    applyPreset(preset)
    // Not preset.config directly - applyPreset() preserves the current brightness_percent rather
    // than the preset's own neutral placeholder value, so the live state is what actually applied.
    this.themeConfigChange.emit({ ...themeState })
  }

  render() {
    const activeName = this.activePresetName
    return (
      <div class="theme-selector">
        <div class="theme-preset-grid">
          {selectablePresets.map(preset => (
            <button
              type="button"
              class={{
                'theme-preset-card': true,
                'theme-preset-card--active': activeName === preset.name,
              }}
              onClick={() => this.pickPreset(preset)}
            >
              <span
                class="theme-preset-swatch"
                style={{
                  background: preset.config.ion_background_color,
                  borderRadius: [
                    preset.config.corner_radius_top_left,
                    preset.config.corner_radius_top_right,
                    preset.config.corner_radius_bottom_right,
                    preset.config.corner_radius_bottom_left,
                  ].map(v => `${v}px`).join(' '),
                }}
              >
                <span class="theme-preset-dot" style={{ background: preset.config.ion_color_primary }}></span>
                <span class="theme-preset-dot" style={{ background: preset.config.ion_color_secondary }}></span>
              </span>
              <span class="theme-preset-name">{preset.name}</span>
              <span class="theme-preset-kind">{preset.kind}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }
}
