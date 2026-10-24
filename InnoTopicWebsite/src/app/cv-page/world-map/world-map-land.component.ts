import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The world map's land (an SVG group, ~200 KB of paths), kept apart from WorldMapComponent's markers
 * and interaction. Used inside the map's <svg>: `<g appWorldMapLand />`.
 */
@Component({
  standalone: true,
  selector: 'g[appWorldMapLand]',
  templateUrl: './world-map-land.component.html',
  styles: [`
    /* Theme colors, so the map follows the active/customized theme; the fallback is the original art. */
    .land {
      fill: var(--ion-color-primary, rgb(39, 120, 156));
      fill-rule: nonzero;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapLandComponent {}
