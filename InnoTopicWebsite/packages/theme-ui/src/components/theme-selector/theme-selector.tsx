import { Component, forceUpdate, h } from '@stencil/core'
import { themeState, setThemeConfig, initThemeConfig, onThemeStateChange } from '../../engine/theme-store'
import { injectThemeTokens } from '../../engine/tokens'
import { themePresets, ThemePreset } from '../../engine/theme-presets'

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
    const current = themeState
    return themePresets.find(preset =>
      preset.config.ion_background_color === current.ion_background_color
      && preset.config.ion_color_primary === current.ion_color_primary
      && preset.config.ion_color_secondary === current.ion_color_secondary,
    )?.name
  }

  private applyPreset(preset: ThemePreset) {
    setThemeConfig(preset.config)
  }

  render() {
    const activeName = this.activePresetName
    return (
      <div class="theme-selector">
        <div class="theme-preset-grid">
          {themePresets.map(preset => (
            <button
              type="button"
              class={{
                'theme-preset-card': true,
                'theme-preset-card--active': activeName === preset.name,
              }}
              onClick={() => this.applyPreset(preset)}
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
