import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import {
  AmbientLight, BackSide, BufferGeometry, Color,
  DirectionalLight, Group, Line, LineBasicMaterial,
  Mesh, MeshPhongMaterial, PerspectiveCamera,
  Scene, ShaderMaterial, SphereGeometry, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThemeConfigState } from '../../models/theme-config-state.model';

const WORKED_ISO3 = new Set(['DEU', 'AUT', 'POL', 'GBR', 'USA', 'ESP', 'LUX', 'IND', 'ARE']);
const WORKED_NAMES = new Set(['France']);

function isWorked(props: any): boolean {
  return WORKED_ISO3.has(props?.['ISO3166-1-Alpha-3']) || WORKED_NAMES.has(props?.name);
}

function lonLatToVec3(lon: number, lat: number, r = 1.001): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function extractRings(geometry: any): number[][][] {
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();
  return [];
}

const ATMOSPHERE_VERT = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const ATMOSPHERE_FRAG = `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
    gl_FragColor = vec4(glowColor, intensity * 0.75);
  }`;

@Component({
  standalone: true,
  selector: 'app-globe-threejs',
  template: `<canvas #canvas style="width:100%;height:460px;display:block"></canvas>`,
  styles: [`:host { display: block; }`],
})
export class GlobeThreejsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private renderer!: WebGLRenderer;
  private animId?: number;

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
      this.buildScene(geojson, primaryColor ?? '#3498db');
    });
  }

  private buildScene(geojson: any, primaryColorHex: string) {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 500;
    const height = 460;

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    const scene = new Scene();
    const camera = new PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 2.6;

    const controls = new OrbitControls(camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lights
    scene.add(new AmbientLight(0x334466, 1.5));
    const sun = new DirectionalLight(0xffffff, 0.9);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // Globe sphere
    scene.add(new Mesh(
      new SphereGeometry(1, 64, 64),
      new MeshPhongMaterial({ color: 0x0d1f3c, specular: 0x223366, shininess: 25 }),
    ));

    // Atmosphere glow (back-face only, renders as outer halo)
    scene.add(new Mesh(
      new SphereGeometry(1.12, 64, 64),
      new ShaderMaterial({
        side: BackSide,
        transparent: true,
        uniforms: { glowColor: { value: new Color(0x4488dd) } },
        vertexShader: ATMOSPHERE_VERT,
        fragmentShader: ATMOSPHERE_FRAG,
      }),
    ));

    // Country border lines from GeoJSON
    scene.add(this.buildCountryLines(geojson, primaryColorHex));

    const tick = () => {
      this.animId = requestAnimationFrame(tick);
      controls.update();
      this.renderer.render(scene, camera);
    };
    tick();
  }

  private buildCountryLines(geojson: any, primaryColorHex: string): Group {
    const primaryColor = new Color(primaryColorHex);
    const group = new Group();

    for (const feature of geojson.features) {
      const worked = isWorked(feature.properties);
      const color = worked ? primaryColor : new Color(0x2a4070);
      const opacity = worked ? 1 : 0.55;

      for (const ring of extractRings(feature.geometry)) {
        const pts = (ring as number[][]).map(([lon, lat]) => lonLatToVec3(lon, lat));
        const geo = new BufferGeometry().setFromPoints(pts);
        const mat = new LineBasicMaterial({ color, opacity, transparent: !worked });
        group.add(new Line(geo, mat));
      }
    }
    return group;
  }

  ngOnDestroy() {
    if (this.animId !== undefined) cancelAnimationFrame(this.animId);
    this.renderer?.dispose();
  }
}
