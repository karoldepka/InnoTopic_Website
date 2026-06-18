import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SVGLoader, SVGResultPaths } from 'three/examples/jsm/loaders/SVGLoader';
import { psilo, psilo2, svgFileData, yin, yin2 } from './svg.data';

@Component({
  standalone: false,
  selector: 'app-merch-gen-page',
  templateUrl: './merch-gen.page.html',
  styleUrls: ['./merch-gen.page.scss'],
})
export class MerchGenPage implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer', { static: false }) rendererContainer!: ElementRef;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    const scene = this.createScene();
    const camera = this.createCamera();
    const renderer = this.createRenderer();

    this.addLights(scene);
    const fullGroup = this.createSVGs();

    scene.add(fullGroup);
    this.fitCameraToScene(camera, fullGroup);
    this.animate(fullGroup, renderer, scene, camera);
  }

  private createScene(): THREE.Scene {
    return new THREE.Scene();
  }

  private createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(75, this.getAspectRatio(), 0.1, 5000); // Adjusted far clipping plane
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(this.getContainerWidth(), this.getContainerHeight());
    this.rendererContainer.nativeElement.appendChild(renderer.domElement);
    return renderer;
  }

  private addLights(scene: THREE.Scene): void {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const highlightLight = new THREE.DirectionalLight(0xffffff, 0.5);
    highlightLight.position.set(-1, 1, 2);
    scene.add(highlightLight);
  }

  private createSVGs(): THREE.Group {
    const loader = new SVGLoader();
    const svgFiles = [yin2, psilo2]; // Load multiple SVGs
    const fullGroup = new THREE.Group();

    const spacing = 150; // Distance between SVGs
    let currentX = 0;

    svgFiles.forEach((svgData, index) => {
      const svgGroup = this.createSVGGroup(loader, svgData);
      svgGroup.position.x += currentX;
      currentX += this.getGroupSize(svgGroup).x + spacing;
      fullGroup.add(svgGroup);
    });

    // Center the entire set
    this.centerGroup(fullGroup);
    return fullGroup;
  }

  private createSVGGroup(loader: SVGLoader, svgData: string): THREE.Group {
    const svg = loader.parse(svgData);
    const paths = svg.paths;
    const svgGroup = new THREE.Group();

    paths.forEach((path: SVGResultPaths) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape: THREE.Shape) => {
        const mesh = this.createExtrudeMesh(shape);
        svgGroup.add(mesh);
      });
    });

    // Center this individual SVG group
    this.centerGroup(svgGroup);

    return svgGroup;
  }

  private createExtrudeMesh(shape: THREE.Shape): THREE.Mesh {
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 10,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1,
      bevelSegments: 5,
      curveSegments: 100,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial({
      color: 0x800080,  // Purple color
      specular: 0xffffff,
      shininess: 100,
    });

    return new THREE.Mesh(geometry, material);
  }

  private centerGroup(group: THREE.Group): void {
    const box = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.sub(center);
  }

  private getGroupSize(group: THREE.Group): THREE.Vector3 {
    const box = new THREE.Box3().setFromObject(group);
    return box.getSize(new THREE.Vector3());
  }

  private fitCameraToScene(camera: THREE.PerspectiveCamera, fullGroup: THREE.Group): void {
    const fullBox = new THREE.Box3().setFromObject(fullGroup);
    const size = new THREE.Vector3();
    fullBox.getSize(size);
    const maxDim = Math.max(size.x, size.y);
    const fov = camera.fov * (Math.PI / 180);
    let distance = maxDim / (2 * Math.tan(fov / 2));
    distance *= 1.4;
    camera.position.z = distance;
  }

  private animate(fullGroup: THREE.Group, renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    const animate = () => {
      requestAnimationFrame(animate);
      fullGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    animate();
  }

  private getContainerWidth(): number {
    return this.rendererContainer.nativeElement.clientWidth;
  }

  private getContainerHeight(): number {
    return this.rendererContainer.nativeElement.clientHeight;
  }

  private getAspectRatio(): number {
    return this.getContainerWidth() / this.getContainerHeight();
  }
}
