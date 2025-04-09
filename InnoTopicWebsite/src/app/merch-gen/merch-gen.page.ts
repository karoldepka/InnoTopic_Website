import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import {psilo, psilo2, svgFileData, yin, yin2} from "./svg.data";

@Component({
  selector: 'app-merch-gen-page',
  templateUrl: './merch-gen.page.html',
  styleUrls: ['./merch-gen.page.scss'],
})
export class MerchGenPage implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer', {static: false}) rendererContainer!: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, this.getAspectRatio(), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(this.getContainerWidth(), this.getContainerHeight());
    this.rendererContainer.nativeElement.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const highlightLight = new THREE.DirectionalLight(0xffffff, 0.5);
    highlightLight.position.set(-1, 1, 2);
    scene.add(highlightLight);

    const loader = new SVGLoader();
    const svgFiles = [/*svgFileData, yin, yin2, */psilo2]; // Load multiple SVGs
    const fullGroup = new THREE.Group();

    const spacing = 150; // Distance between SVGs
    let currentX = 0;

    svgFiles.forEach((svgData, index) => {
      const svg = loader.parse(svgData);
      const paths = svg.paths;
      const svgGroup = new THREE.Group();

      paths.forEach(path => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach(shape => {
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
            color: 0xffff00,
            specular: 0xffffff,
            shininess: 100,
          });

          const mesh = new THREE.Mesh(geometry, material);
          svgGroup.add(mesh);
        });
      });

      // Center this individual SVG group
      const box = new THREE.Box3().setFromObject(svgGroup);
      const center = new THREE.Vector3();
      box.getCenter(center);
      svgGroup.position.sub(center);

      // Then shift it over based on index
      svgGroup.position.x += currentX;
      currentX += box.getSize(new THREE.Vector3()).x + spacing;

      fullGroup.add(svgGroup);
    });

    // Center the entire set
    const fullBox = new THREE.Box3().setFromObject(fullGroup);
    const fullCenter = new THREE.Vector3();
    fullBox.getCenter(fullCenter);
    fullGroup.position.sub(fullCenter);

    // Fit to camera
    const size = new THREE.Vector3();
    fullBox.getSize(size);
    const maxDim = Math.max(size.x, size.y);
    const fov = camera.fov * (Math.PI / 180);
    let distance = maxDim / (2 * Math.tan(fov / 2));
    distance *= 1.4;
    camera.position.z = distance;

    scene.add(fullGroup);

    // Animate
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
