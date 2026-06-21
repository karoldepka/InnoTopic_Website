import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { ThemeConfigState } from '../../models/theme-config-state.model';

// ISO-A3 codes for countries Karol has worked in; France uses name fallback (ISO bug in dataset)
const WORKED_ISO3 = new Set(['DEU', 'AUT', 'POL', 'GBR', 'USA', 'ESP', 'LUX', 'IND', 'ARE']);
const WORKED_NAMES = new Set(['France']);

function isWorked(props: any): boolean {
  return WORKED_ISO3.has(props?.['ISO3166-1-Alpha-3']) || WORKED_NAMES.has(props?.name);
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

    this.globe = (Globe as any)()(el)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('rgba(100,160,255,0.5)')
      .atmosphereAltitude(0.15)
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg')
      .polygonsData(geojson.features)
      .polygonCapColor((d: any) => isWorked(d.properties) ? color : 'rgba(0,0,0,0)')
      .polygonSideColor(() => 'rgba(0,0,0,0)')
      .polygonStrokeColor(() => 'rgba(0,0,0,0)')
      .polygonAltitude((d: any) => isWorked(d.properties) ? 0.04 : 0)
      .polygonLabel((d: any) => `<b>${d.properties?.name ?? ''}</b>`)
      .width(el.clientWidth || 500)
      .height(460);

    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 0.5;
    this.globe.controls().enableZoom = false;

    this.ngZone.run(() => { this.loading = false; });
  }

  ngOnDestroy() {
    this.globe?._destructor?.();
  }
}
