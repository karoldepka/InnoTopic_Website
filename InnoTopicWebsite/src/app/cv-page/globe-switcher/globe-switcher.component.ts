import { NgComponentOutlet } from '@angular/common';
import { Component, OnInit, Type } from '@angular/core';

type GlobeMode = 'globegl' | 'd3' | 'threejs' | 'svg';
type GlobeComponent = Type<unknown>;

const GLOBE_LOADERS: Record<GlobeMode, () => Promise<GlobeComponent>> = {
  globegl: () => import('../globe-gl/globe-gl.component').then(m => m.GlobeGlComponent),
  d3: () => import('../globe-d3/globe-d3.component').then(m => m.GlobeD3Component),
  threejs: () => import('../globe-threejs/globe-threejs.component').then(m => m.GlobeThreejsComponent),
  svg: () => import('../world-map/world-map.component').then(m => m.WorldMapComponent),
};

@Component({
  standalone: true,
  imports: [NgComponentOutlet],
  selector: 'app-globe-switcher',
  templateUrl: './globe-switcher.component.html',
  styleUrls: ['./globe-switcher.component.scss'],
})
export class GlobeSwitcherComponent implements OnInit {
  activeMode: GlobeMode = 'd3';
  activeComponent?: GlobeComponent;
  loadingMode?: GlobeMode;
  private loadToken = 0;
  private readonly componentCache = new Map<GlobeMode, GlobeComponent>();

  ngOnInit() {
    void this.setMode(this.activeMode);
    this.scheduleIdlePrefetch();
  }

  readonly modes: { key: GlobeMode; label: string; tech: string }[] = [
    { key: 'globegl', label: 'Globe.gl',  tech: 'WebGL + Three.js via Globe.gl' },
    { key: 'd3',      label: 'D3',        tech: 'SVG · geoOrthographic projection' },
    { key: 'threejs', label: 'Three.js',  tech: 'Raw WebGL · custom geo lines' },
    { key: 'svg',     label: 'SVG Map',   tech: 'Flat SVG world map' },
  ];

  get activeTech(): string {
    return this.modes.find(m => m.key === this.activeMode)?.tech ?? '';
  }

  async setMode(mode: GlobeMode) {
    this.activeMode = mode;
    this.loadingMode = mode;
    const token = ++this.loadToken;

    const component = await this.loadComponent(mode);
    if (token !== this.loadToken) {
      return;
    }

    this.activeComponent = component;
    this.loadingMode = undefined;
  }

  private async loadComponent(mode: GlobeMode): Promise<GlobeComponent> {
    const cached = this.componentCache.get(mode);
    if (cached) {
      return cached;
    }

    const component = await GLOBE_LOADERS[mode]();
    this.componentCache.set(mode, component);
    return component;
  }

  private scheduleIdlePrefetch() {
    const modesToPrefetch: GlobeMode[] = ['svg', 'globegl', 'threejs'];
    const schedule = (cb: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(cb, { timeout: 4000 });
        return;
      }

      setTimeout(cb, 2000);
    };

    let index = 0;
    const prefetchNext = () => {
      const mode = modesToPrefetch[index++];
      if (!mode) {
        return;
      }

      void this.loadComponent(mode)
        .then(() => mode === 'globegl' ? import('globe.gl') : undefined)
        .catch(err => console.warn(`Failed to prefetch ${mode} globe mode`, err))
        .finally(() => schedule(prefetchNext));
    };

    schedule(prefetchNext);
  }
}
