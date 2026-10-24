import { projectToMap } from './world-map-projection';

export interface MapCity {
  name: string;
  country: string;
  /** Position on the map art (viewBox 468 × 239). */
  x: number;
  y: number;
  /** Place names to look for in the work history's `locations` (default: the name). */
  workLocations?: string[];
}

/** A dot from the original map art, kept where it was drawn. */
function drawn(name: string, country: string, x: number, y: number, workLocations?: string[]): MapCity {
  return { name, country, x, y, workLocations };
}

/** A city placed by its coordinates (see projectToMap). */
function at(name: string, country: string, lat: number, lng: number, workLocations?: string[]): MapCity {
  return { name, country, ...projectToMap(lat, lng), workLocations };
}

/**
 * The map's city dots. The original art's dots were hand-placed, without names; each name below is
 * the nearest place from the work history or the globes' city list, or else the region it sits in.
 */
export const MAP_CITIES: MapCity[] = [
  // Original dots
  drawn('Silicon Valley', 'USA', 48.97, 74.09),
  drawn('San Francisco', 'USA', 50, 67.67),
  drawn('Washington State', 'USA', 61, 57.67),
  drawn('Memphis', 'USA', 91.73, 78.3),
  drawn('North Carolina', 'USA', 112.73, 77.3),
  drawn('Málaga', 'Spain', 219.57, 74.8),
  drawn('Madrid', 'Spain', 218.57, 68.8),
  drawn('Galicia', 'Spain', 213.57, 63.8),
  drawn('Barcelona', 'Spain', 225.5, 68.4),
  drawn('London', 'UK', 224.51, 48.42),
  drawn('Paris', 'France', 224.54, 54.06),
  drawn('Luxembourg', 'Luxembourg', 230.54, 53.06),
  drawn('Heilbronn', 'Germany', 238.15, 55.28),
  drawn('Bavaria', 'Germany', 241.88, 53.89),
  drawn('Berlin & Potsdam', 'Germany', 242.28, 49.84, ['Berlin', 'Potsdam']),
  drawn('Chojnice', 'Poland', 248.25, 45.6),
  drawn('Kraków', 'Poland', 250.1, 51.05),
  drawn('Warsaw', 'Poland', 252.39, 47.6),
  drawn('Bangalore', 'India', 346.13, 117.24),
  // From the work history
  at('Los Angeles', 'USA', 34.05, -118.24),
  at('Koszalin', 'Poland', 54.19, 16.17),
  at('Wrocław', 'Poland', 51.11, 17.04),
  at('Dubai', 'UAE', 25.2, 55.27),
];
