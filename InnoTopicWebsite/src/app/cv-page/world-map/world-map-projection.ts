/**
 * Where a latitude/longitude lies on the world map's art (viewBox 468 × 239). The art is a Robinson
 * projection, cropped; its parameters were fitted to the exact extremes of the land shapes (Africa,
 * South America, Australia, Greenland), to within about half a viewBox unit.
 */

/** Robinson's table, every 5° of latitude: [X (parallel length), Y (distance from the equator)]. */
const ROBINSON: readonly (readonly [number, number])[] = [
  [1, 0], [0.9986, 0.062], [0.9954, 0.124], [0.99, 0.186], [0.9822, 0.248], [0.973, 0.31], [0.96, 0.372],
  [0.9427, 0.434], [0.9216, 0.4958], [0.8962, 0.5571], [0.8679, 0.6176], [0.835, 0.6769], [0.7986, 0.7346],
  [0.7597, 0.7903], [0.7186, 0.8435], [0.6732, 0.8936], [0.6213, 0.9394], [0.5722, 0.9761], [0.5322, 1],
];

const X0 = 224.6222;
const EQUATOR_Y = 139.3426;
const SCALE_X = 1.5524; // viewBox units per degree of longitude at the equator
const SCALE_Y = 141.223;
const CENTRAL_MERIDIAN = 0.7886;

export const MAP_WIDTH = 468;
export const MAP_HEIGHT = 239;

export function projectToMap(lat: number, lng: number): { x: number; y: number } {
  const t = Math.min(Math.abs(lat), 89.999) / 5;
  const i = Math.floor(t);
  const f = t - i;
  const parallel = ROBINSON[i][0] + (ROBINSON[i + 1][0] - ROBINSON[i][0]) * f;
  const fromEquator = ROBINSON[i][1] + (ROBINSON[i + 1][1] - ROBINSON[i][1]) * f;
  return {
    x: X0 + SCALE_X * parallel * (lng - CENTRAL_MERIDIAN),
    y: EQUATOR_Y - Math.sign(lat) * SCALE_Y * fromEquator,
  };
}

/** Parallels and meridians every `step` degrees, as one SVG path (the map's background grid). */
export function graticulePath(step = 30): string {
  const point = (lat: number, lng: number) => {
    const { x, y } = projectToMap(lat, lng);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  const lines: string[] = [];
  for (let lat = -90 + step; lat < 90; lat += step) {
    lines.push(`M${point(lat, -180)}L${point(lat, 180)}`);
  }
  for (let lng = -180; lng <= 180; lng += step) {
    const points: string[] = [];
    for (let lat = -90; lat <= 90; lat += 5) points.push(point(lat, lng));
    lines.push(`M${points.join('L')}`);
  }
  return lines.join('');
}
