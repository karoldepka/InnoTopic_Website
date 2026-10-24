import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { WorkOrganisationsAndProjectsData } from '../../work-projects/work-projects-data';
import { MAP_CITIES, MapCity } from './world-map-cities';
import { WorldMapLandComponent } from './world-map-land.component';
import { graticulePath, MAP_HEIGHT, MAP_WIDTH } from './world-map-projection';

/** Lowercase without diacritics, so "Wroclaw" in the work history finds "Wrocław". */
const plain = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** The organisations whose work history lists this city among its locations. */
function organisationsIn(city: MapCity): string[] {
  const places = (city.workLocations ?? [city.name]).map(plain);
  return Object.entries(WorkOrganisationsAndProjectsData.instance)
    .filter(([, org]) => org.locations && places.some(place => plain(org.locations!).includes(place)))
    .map(([name]) => name);
}

interface CityMarker extends MapCity {
  label: string;
  organisations: string[];
  /** Where the tooltip sits, as a fraction of the map; it hugs the map's edges near them. */
  left: number;
  top: number;
  align: 'start' | 'center' | 'end';
  /** In the map's upper part the tooltip opens downward, so it stays on the map. */
  below: boolean;
}

let nextId = 0;

/**
 * Flat world map of the cities Karol has worked in or with: hovering, tapping or focusing a city
 * shows its name and the organisations there. A faint dot texture and grid sit behind the land.
 */
@Component({
  standalone: true,
  imports: [WorldMapLandComponent],
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.sass'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'active.set(undefined)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapComponent {
  protected readonly width = MAP_WIDTH;
  protected readonly height = MAP_HEIGHT;
  protected readonly ids = { texture: `world-map-texture-${nextId}`, marker: `world-map-marker-${nextId++}` };
  protected readonly graticule = graticulePath();
  protected readonly cities: CityMarker[] = MAP_CITIES.map(city => {
    const left = city.x / MAP_WIDTH;
    const top = city.y / MAP_HEIGHT;
    return {
      ...city,
      label: `${city.name}, ${city.country}`,
      organisations: organisationsIn(city),
      left,
      top,
      align: left < 0.15 ? 'start' : left > 0.85 ? 'end' : 'center',
      below: top < 0.5,
    };
  });
  protected readonly active = signal<CityMarker | undefined>(undefined);

  /** Mouse hover shows and hides it; touch and pen keep it until another tap (see select). */
  protected onPointerEnter(city: CityMarker, event: PointerEvent) {
    if (event.pointerType === 'mouse') this.active.set(city);
  }

  protected onPointerLeave(event: PointerEvent) {
    if (event.pointerType === 'mouse') this.active.set(undefined);
  }

  protected select(city: CityMarker, event: Event) {
    event.stopPropagation(); // not an outside click
    this.active.set(city);
  }

  protected onDocumentClick(event: Event) {
    if (!(event.target as Element | null)?.closest?.('.marker')) this.active.set(undefined);
  }
}
