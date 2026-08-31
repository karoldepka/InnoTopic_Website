import { Component, State, forceUpdate, h } from '@stencil/core'
import { themeState, setThemeConfig, initThemeConfig, onThemeStateChange } from '../../engine/theme-store'
import { injectThemeTokens } from '../../engine/tokens'
import type { ThemeConfigState } from '../../engine/theme-config-state'
// Side-effect import: registers <topic-tag> so the live preview below can render it.
// Demonstrates the deliberate Stencil -> Lit dependency: this configurator embeds real
// @innotopic/topics-ui chips so you can see themed chips while tuning colors, the same role
// the Angular app's <app-tinted-swatches>/<app-theme-samples> preview components played.
import '@innotopic/topics-ui'
import { onSvgRecolorProgress, type SvgRecolorProgress } from '@innotopic/topics-ui'

const ALL_KEYS: (keyof ThemeConfigState)[] = [
  'ion_color_primary', 'ion_color_secondary', 'ion_background_color',
  'shadow_offset', 'shadow_blur_radius', 'shadow_opacity',
  'inner_shadow_offset', 'inner_shadow_blur_radius', 'inner_shadow_opacity',
  'corner_radius_top_left', 'corner_radius_top_right', 'corner_radius_bottom_right', 'corner_radius_bottom_left',
  'icon_color_mode', 'icon_contrast', 'icon_brightness',
]

type CornerKey = 'corner_radius_top_left' | 'corner_radius_top_right' | 'corner_radius_bottom_right' | 'corner_radius_bottom_left'

// Visual (not data) order - lays out as a physical 2x2 grid matching the actual corners.
const CORNER_FIELDS: Array<{ key: CornerKey; label: string }> = [
  { key: 'corner_radius_top_left', label: 'Top-left' },
  { key: 'corner_radius_top_right', label: 'Top-right' },
  { key: 'corner_radius_bottom_left', label: 'Bottom-left' },
  { key: 'corner_radius_bottom_right', label: 'Bottom-right' },
]

/** Ports Angular's theme-config.component (the freeform "theme-configurator"). */
@Component({
  tag: 'theme-configurator',
  styleUrl: 'theme-configurator.css',
  shadow: true,
})
export class ThemeConfigurator {
  private unsubscribes: Array<() => void> = []

  // Locked by default: one corner's slider drives all four, matching the topic-chip's
  // existing "single radius pair" look until someone deliberately opts into independent corners.
  @State() cornersLocked = true
  @State() recolorProgress?: SvgRecolorProgress

  connectedCallback() {
    injectThemeTokens()
    initThemeConfig()
    ALL_KEYS.forEach(key => {
      this.unsubscribes.push(onThemeStateChange(key, () => forceUpdate(this)))
    })
    this.unsubscribes.push(onSvgRecolorProgress(progress => { this.recolorProgress = progress }))
  }

  disconnectedCallback() {
    this.unsubscribes.forEach(off => off())
    this.unsubscribes = []
  }

  private onColorInput(field: 'ion_color_primary' | 'ion_color_secondary' | 'ion_background_color', event: Event) {
    setThemeConfig({ [field]: (event.target as HTMLInputElement).value } as Partial<ThemeConfigState>)
  }

  private onPrimaryColorWheel(event: PointerEvent) {
    const wheel = event.currentTarget as HTMLElement
    const bounds = wheel.getBoundingClientRect()
    const x = event.clientX - bounds.left - bounds.width / 2
    const y = event.clientY - bounds.top - bounds.height / 2
    const radius = Math.min(bounds.width, bounds.height) / 2
    const saturation = Math.hypot(x, y) / radius
    if (saturation > 1) return
    const hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
    const chroma = saturation
    const secondary = chroma * (1 - Math.abs((hue / 60) % 2 - 1))
    const [r, g, b] = hue < 60 ? [chroma, secondary, 0] : hue < 120 ? [secondary, chroma, 0]
      : hue < 180 ? [0, chroma, secondary] : hue < 240 ? [0, secondary, chroma]
        : hue < 300 ? [secondary, 0, chroma] : [chroma, 0, secondary]
    const toHex = (value: number) => Math.round(value * 255).toString(16).padStart(2, '0')
    setThemeConfig({ ion_color_primary: `#${toHex(r)}${toHex(g)}${toHex(b)}` })
  }

  private onRangeInput(field: 'shadow_offset' | 'shadow_blur_radius' | 'shadow_opacity' | 'inner_shadow_offset' | 'inner_shadow_blur_radius' | 'inner_shadow_opacity', event: Event) {
    const raw = (event.target as HTMLInputElement).value
    const isOpacityField = field === 'shadow_opacity' || field === 'inner_shadow_opacity'
    setThemeConfig({ [field]: isOpacityField ? Number(raw) : raw } as Partial<ThemeConfigState>)
  }

  private onIconInput(field: 'icon_contrast' | 'icon_brightness', event: Event) {
    setThemeConfig({ [field]: Number((event.target as HTMLInputElement).value) } as Partial<ThemeConfigState>)
  }

  private onIconColorModeInput(event: Event) {
    const icon_color_mode = (event.target as HTMLSelectElement).value as ThemeConfigState['icon_color_mode']
    setThemeConfig({
      icon_color_mode,
      // Primary ± contrast is constrained to the Rust converter's 0..1 tolerance range.
      icon_contrast: icon_color_mode === 'primary_contrast' ? Math.min(themeState.icon_contrast, 1) : themeState.icon_contrast,
    })
  }

  private onCornerInput(key: CornerKey, event: Event) {
    const raw = (event.target as HTMLInputElement).value
    if (this.cornersLocked) {
      setThemeConfig({
        corner_radius_top_left: raw,
        corner_radius_top_right: raw,
        corner_radius_bottom_right: raw,
        corner_radius_bottom_left: raw,
      })
    } else {
      setThemeConfig({ [key]: raw } as Partial<ThemeConfigState>)
    }
  }

  private toggleCornersLocked = () => {
    const locking = !this.cornersLocked
    if (locking) {
      // Re-locking after corners have diverged snaps them all to one value (top-left as the
      // anchor) so "locked" always means "actually uniform", not just "will be from now on".
      const anchor = themeState.corner_radius_top_left
      setThemeConfig({
        corner_radius_top_left: anchor,
        corner_radius_top_right: anchor,
        corner_radius_bottom_right: anchor,
        corner_radius_bottom_left: anchor,
      })
    }
    this.cornersLocked = locking
  }

  render() {
    const s = themeState
    return (
      <div class="theme-configurator">
        <div class="field-row">
          <label class="field">
            <span class="field-label">Primary</span>
            <input type="color" value={s.ion_color_primary} onInput={e => this.onColorInput('ion_color_primary', e)} />
            <button type="button" class="color-wheel" onPointerDown={e => this.onPrimaryColorWheel(e)} aria-label="Choose primary color from color wheel" title="Choose primary color"></button>
          </label>
          <label class="field">
            <span class="field-label">Secondary</span>
            <input type="color" value={s.ion_color_secondary} onInput={e => this.onColorInput('ion_color_secondary', e)} />
          </label>
          <label class="field">
            <span class="field-label">Background</span>
            <input type="color" value={s.ion_background_color} onInput={e => this.onColorInput('ion_background_color', e)} />
          </label>
        </div>

        <div class="field-row">
          <label class="field">
            <span class="field-label">Shadow offset ({s.shadow_offset}px)</span>
            <input type="range" min="-10" max="10" value={s.shadow_offset}
                   onInput={e => this.onRangeInput('shadow_offset', e)} />
          </label>
          <label class="field">
            <span class="field-label">Shadow blur ({s.shadow_blur_radius}px)</span>
            <input type="range" min="0" max="20" value={s.shadow_blur_radius}
                   onInput={e => this.onRangeInput('shadow_blur_radius', e)} />
          </label>
          <label class="field">
            <span class="field-label">Shadow opacity ({s.shadow_opacity}%)</span>
            <input type="range" min="0" max="100" value={String(s.shadow_opacity)}
                   onInput={e => this.onRangeInput('shadow_opacity', e)} />
          </label>
        </div>

        <div class="field-row">
          <label class="field">
            <span class="field-label">Inner shadow offset ({s.inner_shadow_offset}px)</span>
            <input type="range" min="-10" max="10" value={s.inner_shadow_offset}
                   onInput={e => this.onRangeInput('inner_shadow_offset', e)} />
          </label>
          <label class="field">
            <span class="field-label">Inner shadow blur ({s.inner_shadow_blur_radius}px)</span>
            <input type="range" min="0" max="20" value={s.inner_shadow_blur_radius}
                   onInput={e => this.onRangeInput('inner_shadow_blur_radius', e)} />
          </label>
          <label class="field">
            <span class="field-label">Inner shadow opacity ({s.inner_shadow_opacity}%)</span>
            <input type="range" min="0" max="100" value={String(s.inner_shadow_opacity)}
                   onInput={e => this.onRangeInput('inner_shadow_opacity', e)} />
          </label>
        </div>

        <div class="corners-section">
          <div class="corners-header">
            <span class="field-label">Corners</span>
            <button
              type="button"
              class="lock-toggle"
              aria-pressed={this.cornersLocked ? 'true' : 'false'}
              aria-label={this.cornersLocked ? 'Corners linked - click to unlock' : 'Corners independent - click to lock'}
              title={this.cornersLocked ? 'Corners linked' : 'Corners independent'}
              onClick={this.toggleCornersLocked}
            >
              {this.cornersLocked ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="11" width="14" height="9" rx="2"></rect>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="11" width="14" height="9" rx="2"></rect>
                  <path d="M8 11V7a4 4 0 0 1 7.75-1.5"></path>
                </svg>
              )}
            </button>
          </div>
          <div class="corners-grid">
            {CORNER_FIELDS.map(({ key, label }) => (
              <label class="field corner-field">
                <span class="field-label">{label} ({s[key]}px)</span>
                <input type="range" min="0" max="40" value={String(s[key])}
                       onInput={e => this.onCornerInput(key, e)} />
              </label>
            ))}
          </div>
        </div>

        <div class="field-row">
          <label class="field">
            <span class="field-label">Icon color mode</span>
            <select onInput={this.onIconColorModeInput.bind(this)}>
              <option value="palette" selected={s.icon_color_mode === 'palette'}>Primary to secondary palette</option>
              <option value="primary_contrast" selected={s.icon_color_mode === 'primary_contrast'}>Primary ± contrast</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">{s.icon_color_mode === 'primary_contrast' ? 'Primary contrast' : 'Icon contrast'} ({s.icon_contrast.toFixed(2)})</span>
            <input type="range" min="0" max={s.icon_color_mode === 'primary_contrast' ? '1' : '2'} step="0.05" value={String(s.icon_contrast)}
                   onInput={e => this.onIconInput('icon_contrast', e)} />
          </label>
          <label class="field">
            <span class="field-label">Icon brightness ({s.icon_brightness.toFixed(2)})</span>
            <input type="range" min="-1" max="1" step="0.05" value={String(s.icon_brightness)}
                   onInput={e => this.onIconInput('icon_brightness', e)} />
          </label>
        </div>

        <div class="preview">
          <span class="preview-label">Live preview:</span>
          <topic-tag
            tid="Angular"
            recolor-primary={s.ion_color_primary}
            recolor-mode={s.icon_color_mode}
            recolor-secondary={s.ion_color_secondary}
            recolor-contrast={s.icon_contrast}
            recolor-brightness={s.icon_brightness}
            recolor-primary-contrast={s.icon_contrast}
          ></topic-tag>
          <topic-tag
            tid="React"
            recolor-primary={s.ion_color_primary}
            recolor-mode={s.icon_color_mode}
            recolor-secondary={s.ion_color_secondary}
            recolor-contrast={s.icon_contrast}
            recolor-brightness={s.icon_brightness}
            recolor-primary-contrast={s.icon_contrast}
          ></topic-tag>
          <topic-tag
            tid="DeepSeek"
            recolor-primary={s.ion_color_primary}
            recolor-mode={s.icon_color_mode}
            recolor-secondary={s.ion_color_secondary}
            recolor-contrast={s.icon_contrast}
            recolor-brightness={s.icon_brightness}
            recolor-primary-contrast={s.icon_contrast}
          ></topic-tag>
        </div>
        {this.recolorProgress && (
          <div class="recolor-progress" role="status" aria-live="polite">
            <span>
              Colorizing {this.recolorProgress.uniqueCompleted} of {this.recolorProgress.uniqueTotal} unique icons
            </span>
            <progress
              value={this.recolorProgress.uniqueCompleted}
              max={this.recolorProgress.uniqueTotal}
              aria-label={`Colorizing ${this.recolorProgress.uniqueCompleted} of ${this.recolorProgress.uniqueTotal} unique icons`}
            ></progress>
          </div>
        )}
      </div>
    )
  }
}
