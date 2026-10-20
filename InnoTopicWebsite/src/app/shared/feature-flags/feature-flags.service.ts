import { Injectable, signal, WritableSignal } from '@angular/core';

export interface FeatureFlagOption {
  value: string;
  label: string;
}

export interface BooleanFeatureFlagDef {
  type: 'boolean';
  key: string;
  label: string;
  description: string;
  signal: WritableSignal<boolean>;
}

export interface SelectFeatureFlagDef {
  type: 'select';
  key: string;
  label: string;
  description: string;
  signal: WritableSignal<string>;
  options: FeatureFlagOption[];
}

export type FeatureFlagDef = BooleanFeatureFlagDef | SelectFeatureFlagDef;

export type WorkProjectSkillsLayout = 'grouped' | 'grouped-inline' | 'flat';

/** Milliseconds a recolored logo takes to fade to its original colors on hover (and back). */
export type LogoHoverFadeMs = '0' | '150' | '250' | '400' | '700';

const STORAGE_KEY_PREFIX = 'featureFlag.';

function loadBooleanFlag(key: string, defaultValue: boolean): boolean {
  if (typeof localStorage === 'undefined') {
    return defaultValue;
  }
  const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
  return stored === null ? defaultValue : stored === 'true';
}

function loadStringFlag<T extends string>(key: string, defaultValue: T): T {
  if (typeof localStorage === 'undefined') {
    return defaultValue;
  }
  const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
  return (stored as T | null) ?? defaultValue;
}

/** Dev-facing toggles for experimental/alternate behavior, surfaced via app-feature-flags-popover. */
@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {

  readonly graphContainer = signal(loadBooleanFlag('graphContainer', true));
  readonly dynamicLogoColorization = signal(loadBooleanFlag('dynamicLogoColorization', true));
  readonly logoHoverFadeMs = signal<LogoHoverFadeMs>(loadStringFlag('logoHoverFadeMs', '250'));
  readonly workProjectSkillsLayout = signal<WorkProjectSkillsLayout>(
    loadStringFlag('workProjectSkillsLayout', 'grouped-inline'));

  readonly flags: FeatureFlagDef[] = [
    {
      type: 'boolean',
      key: 'graphContainer',
      label: 'Graph: contain nodes',
      description: 'Clamp the topics graph nodes within the SVG bounds instead of letting them drift freely.',
      signal: this.graphContainer,
    },
    {
      type: 'boolean',
      key: 'dynamicLogoColorization',
      label: 'Logos: dynamic colorization',
      description: 'Recolor technology logos to match the current theme. Can delay logos while SVGs are converted.',
      signal: this.dynamicLogoColorization,
    },
    {
      type: 'select',
      key: 'logoHoverFadeMs',
      label: 'Logos: hover fade to original colors',
      description: 'How long a recolored logo takes to fade to its original colors on mouse-over, and back.',
      signal: this.logoHoverFadeMs,
      options: [
        { value: '0', label: 'Instant' },
        { value: '150', label: '150 ms (snappy)' },
        { value: '250', label: '250 ms (recommended)' },
        { value: '400', label: '400 ms (relaxed)' },
        { value: '700', label: '700 ms (slow)' },
      ],
    },
    {
      type: 'select',
      key: 'workProjectSkillsLayout',
      label: 'Work projects: skills layout',
      description: 'How each project\'s skill chips are grouped.',
      signal: this.workProjectSkillsLayout,
      options: [
        { value: 'grouped', label: 'Grouped (block headers)' },
        { value: 'grouped-inline', label: 'Grouped (inline labels)' },
        { value: 'flat', label: 'Flat (no grouping)' },
      ],
    },
  ];

  toggle(flag: BooleanFeatureFlagDef) {
    this.setValue(flag, !flag.signal());
  }

  setValue<T extends string | boolean>(flag: { key: string, signal: WritableSignal<T> }, value: T) {
    flag.signal.set(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PREFIX + flag.key, String(value));
    }
  }
}
