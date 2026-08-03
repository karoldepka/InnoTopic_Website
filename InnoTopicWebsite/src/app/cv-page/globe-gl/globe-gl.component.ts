import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import { themeState } from '@innotopic/theme-ui';
import { WORK_CITIES, WorkCity } from '../work-cities';

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
  ) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.init());
  }

  private async init() {
    const tick = () => new Promise<void>(r => setTimeout(r, 0));
    try {
      const primaryColor = themeState.ion_color_primary;

      const [{ default: Globe }, geojson] = await Promise.all([
        import('globe.gl'),
        fetch('assets/data/worked-countries.geojson').then(r => r.json()),
      ]);

      const el = this.containerRef.nativeElement;
      const color = primaryColor ?? '#3498db';

      // Phase 1: create renderer + scene (WebGL context init) — yield first so browser can paint spinner
      await tick();
      this.globe = (Globe as any)()(el)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('rgba(100,160,255,0.5)')
        .atmosphereAltitude(0.15)
        .globeImageUrl('assets/data/earth-dark.jpg')
        .width(el.clientWidth || 500)
        .height(460);

      this.globe.controls().autoRotate = true;
      this.globe.controls().autoRotateSpeed = 0.5;
      this.globe.controls().enableZoom = false;

      // Phase 2: load geometry data — yield so the empty globe can render one frame first
      await tick();
      this.globe
        .polygonsData(geojson.features)
        .polygonCapColor(() => color)
        .polygonSideColor(() => 'rgba(0,0,0,0)')
        .polygonStrokeColor(() => 'rgba(255,255,255,0.2)')
        .polygonAltitude(0.04)
        .polygonLabel((d: any) => `<b>${d.properties?.name ?? ''}</b>`);

      await tick();
      this.globe
        .arcsData(buildArcs())
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
        .pointsData(WORK_CITIES)
        .pointLat((d: WorkCity) => d.lat)
        .pointLng((d: WorkCity) => d.lng)
        .pointColor(() => color)
        .pointAltitude(0.12)
        .pointRadius(0.4)
        .pointLabel((d: WorkCity) => `<b>${d.name}</b><br/>${d.country}`);
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
