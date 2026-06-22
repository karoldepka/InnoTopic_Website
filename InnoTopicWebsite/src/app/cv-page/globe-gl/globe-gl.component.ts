import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { ThemeConfigState } from '../../models/theme-config-state.model';
import { WORK_CITIES, WorkCity } from '../work-cities';

const WORKED_ISO3 = new Set(['DEU', 'AUT', 'POL', 'GBR', 'USA', 'ESP', 'LUX', 'IND', 'ARE']);
const WORKED_NAMES = new Set(['France']);

function isWorked(props: any): boolean {
  return WORKED_ISO3.has(props?.['ISO3166-1-Alpha-3']) || WORKED_NAMES.has(props?.name);
}

interface CityArc { start: WorkCity; end: WorkCity; }

function buildArcs(): CityArc[] {
  const arcs: CityArc[] = [];
  for (let i = 0; i < WORK_CITIES.length; i++) {
    for (let j = i + 1; j < WORK_CITIES.length; j++) {
      arcs.push({ start: WORK_CITIES[i], end: WORK_CITIES[j] });
    }
  }
  return arcs;
}

@Component({
  standalone: true,
  selector: 'app-globe-gl',
  template: `
    <div style="position:relative;width:100%;height:460px">
      <div #container style="width:100%;height:100%"></div>
      <div *ngIf="loading" class="globe-loader">Loading Globe.gl…</div>
    </div>
  `,
  imports: [NgIf],
  styles: [`:host { display: block; }
    .globe-loader {
      position: absolute; inset: 0; display: flex;
      align-items: center; justify-content: center;
      font-size: 13px; opacity: 0.5; pointer-events: none;
    }`],
})
export class GlobeGlComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  loading = true;
  private globe: any;

  constructor(
    private ngZone: NgZone,
    private store: Store<{ themeConfig: ThemeConfigState }>,
  ) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.init());
  }

  private async init() {
    try {
      const primaryColor = await this.store
        .select(s => s.themeConfig.ion_color_primary)
        .pipe(take(1))
        .toPromise();

      const [{ default: Globe }, geojson] = await Promise.all([
        import('globe.gl'),
        fetch('assets/data/countries.geojson').then(r => r.json()),
      ]);

      const el = this.containerRef.nativeElement;
      const color = primaryColor ?? '#3498db';

      // Only pass worked countries to polygonsData — avoids creating WebGL geometry for all ~250 transparent polygons
      const workedFeatures = geojson.features.filter((f: any) => isWorked(f.properties));
      const arcs = buildArcs();

      this.globe = (Globe as any)()(el)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('rgba(100,160,255,0.5)')
        .atmosphereAltitude(0.15)
        .globeImageUrl('assets/data/earth-dark.jpg')
        // Worked-country highlights (filtered — major perf win)
        .polygonsData(workedFeatures)
        .polygonCapColor(() => color)
        .polygonSideColor(() => 'rgba(0,0,0,0)')
        .polygonStrokeColor(() => 'rgba(255,255,255,0.2)')
        .polygonAltitude(0.04)
        .polygonLabel((d: any) => `<b>${d.properties?.name ?? ''}</b>`)
        // Animated arc connectors between all work cities
        .arcsData(arcs)
        .arcStartLat((d: any) => d.start.lat)
        .arcStartLng((d: any) => d.start.lng)
        .arcEndLat((d: any) => d.end.lat)
        .arcEndLng((d: any) => d.end.lng)
        .arcColor(() => color)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(3000)
        .arcStroke(0.4)
        .arcAltitudeAutoScale(0.3)
        // City bar markers (world-population style)
        .pointsData(WORK_CITIES)
        .pointLat((d: WorkCity) => d.lat)
        .pointLng((d: WorkCity) => d.lng)
        .pointColor(() => color)
        .pointAltitude(0.12)
        .pointRadius(0.4)
        .pointLabel((d: WorkCity) => `<b>${d.name}</b><br/>${d.country}`)
        .width(el.clientWidth || 500)
        .height(460);

      this.globe.controls().autoRotate = true;
      this.globe.controls().autoRotateSpeed = 0.5;
      this.globe.controls().enableZoom = false;
    } catch (e) {
      console.error('Globe.gl init failed:', e);
    } finally {
      this.ngZone.run(() => { this.loading = false; });
    }
  }

  ngOnDestroy() {
    this.globe?._destructor?.();
  }
}
