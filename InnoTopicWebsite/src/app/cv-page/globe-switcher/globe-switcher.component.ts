import { Component } from '@angular/core';
import { WorldMapComponent } from '../world-map/world-map.component';
import { GlobeGlComponent } from '../globe-gl/globe-gl.component';
import { GlobeD3Component } from '../globe-d3/globe-d3.component';
import { GlobeThreejsComponent } from '../globe-threejs/globe-threejs.component';

type GlobeMode = 'globegl' | 'd3' | 'threejs' | 'svg';

@Component({
  standalone: true,
  imports: [WorldMapComponent, GlobeGlComponent, GlobeD3Component, GlobeThreejsComponent],
  selector: 'app-globe-switcher',
  templateUrl: './globe-switcher.component.html',
  styleUrls: ['./globe-switcher.component.scss'],
})
export class GlobeSwitcherComponent {
  activeMode: GlobeMode = 'globegl';

  readonly modes: { key: GlobeMode; label: string; tech: string }[] = [
    { key: 'globegl', label: 'Globe.gl',  tech: 'WebGL + Three.js via Globe.gl' },
    { key: 'd3',      label: 'D3',        tech: 'SVG · geoOrthographic projection' },
    { key: 'threejs', label: 'Three.js',  tech: 'Raw WebGL · custom geo lines' },
    { key: 'svg',     label: 'SVG Map',   tech: 'Flat SVG world map' },
  ];

  get activeTech(): string {
    return this.modes.find(m => m.key === this.activeMode)?.tech ?? '';
  }
}
