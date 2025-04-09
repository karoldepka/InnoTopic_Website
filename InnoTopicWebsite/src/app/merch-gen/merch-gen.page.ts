import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import {svgFileData} from "./svg.data";

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

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const loader = new SVGLoader();
    const svgData = loader.parse(svgFileData);

    const paths = svgData.paths;
    const group = new THREE.Group();

    paths.forEach(path => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach(shape => {
        const extrudeSettings: THREE.ExtrudeGeometryOptions = {
          depth: 10,
          bevelEnabled: true,
          bevelThickness: 2,
          bevelSize: 1,
          bevelSegments: 5,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshStandardMaterial({
          color: 0xffff00, // Yellow
          metalness: 0.3,
          roughness: 0.7,
        });

        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });
    });

    // Debug info BEFORE centering
    const boxBefore = new THREE.Box3().setFromObject(group);
    const sizeBefore = new THREE.Vector3();
    boxBefore.getSize(sizeBefore);
    const centerBefore = new THREE.Vector3();
    boxBefore.getCenter(centerBefore);
    console.log('SVG Bounding Box BEFORE centering:', boxBefore);
    console.log('SVG Center BEFORE:', centerBefore);

    // Center the group
    group.position.sub(centerBefore);

    // Debug info AFTER centering
    const boxAfter = new THREE.Box3().setFromObject(group);
    const sizeAfter = new THREE.Vector3();
    boxAfter.getSize(sizeAfter);
    const centerAfter = new THREE.Vector3();
    boxAfter.getCenter(centerAfter);
    console.log('SVG Bounding Box AFTER centering:', boxAfter);
    console.log('SVG Center AFTER:', centerAfter);

    // Fit to camera
    const maxDim = Math.max(sizeAfter.x, sizeAfter.y);
    const fov = camera.fov * (Math.PI / 180);
    let distance = maxDim / (2 * Math.tan(fov / 2));
    distance *= 1.5;
    camera.position.z = distance;

    scene.add(group);

    // Control cube
    const cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, -50);
    scene.add(cube);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      group.rotation.y += 0.005; // Animate SVG group (rotate)
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.1; // subtle bounce

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
