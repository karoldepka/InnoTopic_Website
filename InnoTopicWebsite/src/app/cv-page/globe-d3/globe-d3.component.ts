import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { select } from 'd3-selection';
import { geoOrthographic, geoPath, geoGraticule } from 'd3-geo';
import { drag } from 'd3-drag';
import { ThemeConfigState } from '../../models/theme-config-state.model';

const WORKED_ISO3 = new Set(['DEU', 'AUT', 'POL', 'GBR', 'USA', 'ESP', 'LUX', 'IND', 'ARE']);
const WORKED_NAMES = new Set(['France']);

function isWorked(props: any): boolean {
  return WORKED_ISO3.has(props?.['ISO3166-1-Alpha-3']) || WORKED_NAMES.has(props?.name);
}

@Component({
  standalone: true,
  selector: 'app-globe-d3',
  template: `<svg #svgEl style="width:100%;height:460px;cursor:grab"></svg>`,
  styles: [`:host { display: block; }`],
})
export class GlobeD3Component implements AfterViewInit, OnDestroy {
  @ViewChild('svgEl') svgRef!: ElementRef<SVGElement>;

  private animId?: number;
  private isDragging = false;
  private rotation: [number, number, number] = [20, -30, 0];

  constructor(
    private ngZone: NgZone,
    private store: Store<{ themeConfig: ThemeConfigState }>,
  ) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(async () => {
      const primaryColor = await this.store
        .select(s => s.themeConfig.ion_color_primary)
        .pipe(take(1))
        .toPromise();
      const geojson = await fetch('assets/data/countries.geojson').then(r => r.json());
      this.buildGlobe(geojson, primaryColor ?? '#3498db');
    });
  }

  private buildGlobe(geojson: any, primaryColor: string) {
    const el = this.svgRef.nativeElement;
    const width = el.clientWidth || 500;
    const height = 460;
    const radius = Math.min(width, height) / 2 - 12;

    const projection = geoOrthographic()
      .scale(radius)
      .rotate(this.rotation)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const path = geoPath().projection(projection);
    const graticule = geoGraticule();

    const svg = select(el)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height);

    // Ocean radial gradient
    const defs = svg.append('defs');
    const grad = defs.append('radialGradient')
      .attr('id', 'd3-ocean-grad').attr('cx', '50%').attr('cy', '42%').attr('r', '62%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#1b2f5a');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#080e20');

    defs.append('clipPath').attr('id', 'd3-globe-clip')
      .append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', radius);

    // Ocean fill
    svg.append('circle')
      .attr('cx', width / 2).attr('cy', height / 2).attr('r', radius)
      .attr('fill', 'url(#d3-ocean-grad)');

    // Graticule
    const gratPath = svg.append('path')
      .datum(graticule())
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.07)')
      .attr('stroke-width', 0.5)
      .attr('clip-path', 'url(#d3-globe-clip)')
      .attr('d', path as any);

    // Countries
    const countriesG = svg.append('g').attr('clip-path', 'url(#d3-globe-clip)');
    countriesG.selectAll<SVGPathElement, any>('path')
      .data(geojson.features)
      .join('path')
      .attr('fill', (d: any) => isWorked(d.properties) ? primaryColor + 'cc' : 'rgba(45,75,115,0.65)')
      .attr('stroke', 'rgba(255,255,255,0.18)')
      .attr('stroke-width', 0.4)
      .attr('d', path as any);

    // Atmosphere rim
    svg.append('circle')
      .attr('cx', width / 2).attr('cy', height / 2).attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(120,180,255,0.25)')
      .attr('stroke-width', 7);

    const update = () => {
      projection.rotate(this.rotation);
      countriesG.selectAll('path').attr('d', path as any);
      gratPath.attr('d', path as any);
    };

    // Drag-to-rotate
    let v0: [number, number] | null = null;
    let r0: [number, number, number] | null = null;
    svg.call(
      drag<SVGElement, unknown>()
        .on('start', (e: any) => {
          this.isDragging = true;
          v0 = [e.x, e.y];
          r0 = [...this.rotation] as [number, number, number];
        })
        .on('drag', (e: any) => {
          if (!v0 || !r0) return;
          this.rotation = [
            r0[0] + (e.x - v0[0]) / radius * 60,
            r0[1] - (e.y - v0[1]) / radius * 60,
            0,
          ];
          update();
        })
        .on('end', () => { this.isDragging = false; }),
    );

    // Auto-rotate
    const tick = () => {
      if (!this.isDragging) {
        this.rotation[0] += 0.15;
        update();
      }
      this.animId = requestAnimationFrame(tick);
    };
    this.animId = requestAnimationFrame(tick);
  }

  ngOnDestroy() {
    if (this.animId !== undefined) cancelAnimationFrame(this.animId);
  }
}
